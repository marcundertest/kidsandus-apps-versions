import 'server-only';
import { Octokit } from 'octokit';

interface GithubConfig {
  owner: string;
  repo: string;
  path: string;
  token: string;
}

export class GithubStorage {
  private octokit: Octokit;
  private config: GithubConfig;

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    if (!token || !owner || !repo) {
      console.warn(
        'GithubStorage: Missing environment variables. GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO are required.'
      );
    }

    this.octokit = new Octokit({ auth: token });
    this.config = {
      owner: owner || '',
      repo: repo || '',
      path: 'data.json', // Default path, can be made configurable if needed
      token: token || '',
    };
  }

  async fetchData<T>(): Promise<T | null> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: this.config.path,
        headers: {
          'If-None-Match': '', // Disable caching
        },
      });

      if (Array.isArray(data) || !('content' in data)) {
        throw new Error('GithubStorage: Target is a directory or invalid response');
      }

      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return JSON.parse(content) as T;
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404) {
        return null;
      }
      console.error('GithubStorage: Error fetching data', error);
      throw error;
    }
  }

  async saveData(
    content: unknown,
    message: string = 'chore(data): update data.json',
    retries: number = 3
  ): Promise<void> {
    let currentRetry = 0;

    while (currentRetry < retries) {
      try {
        // 1. Get current SHA (required for update)
        let sha: string | undefined;
        try {
          const { data: currentFile } = await this.octokit.rest.repos.getContent({
            owner: this.config.owner,
            repo: this.config.repo,
            path: this.config.path,
            headers: {
              'If-None-Match': '', // Disable caching to ensure we get the latest SHA
            },
          });

          if (!Array.isArray(currentFile) && 'sha' in currentFile) {
            sha = currentFile.sha;
          }
        } catch (error: unknown) {
          const err = error as { status?: number };
          if (err.status !== 404) throw error;
          // If 404, it means file doesn't exist, so we create it (sha not needed)
        }

        // 2. Commit the new content
        const contentString = JSON.stringify(content, null, 2);
        const contentBase64 = Buffer.from(contentString).toString('base64');

        await this.octokit.rest.repos.createOrUpdateFileContents({
          owner: this.config.owner,
          repo: this.config.repo,
          path: this.config.path,
          message,
          content: contentBase64,
          sha,
          author: {
            name: 'Netlify',
            email: 'bot@netlify.com',
          },
          committer: {
            name: 'Netlify',
            email: 'bot@netlify.com',
          },
        });

        console.log('GithubStorage: Saved successfully');
        return; // Success, exit loop
      } catch (error: unknown) {
        const err = error as { status?: number };

        // 409 is the specific conflict error for SHA mismatch in GitHub API
        if (err.status === 409 || err.status === 422) {
          currentRetry++;
          console.warn(
            `GithubStorage: Conflict detected (SHA mismatch). Retrying ${currentRetry}/${retries}...`
          );

          if (currentRetry >= retries) {
            console.error('GithubStorage: Max retries exceeded. Save failed.');
            throw error;
          }

          // Random backoff between 500ms and 1500ms to desynchronize competing requests
          const delay = Math.floor(Math.random() * 1000) + 500;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        console.error('GithubStorage: Error saving data', error);
        throw error;
      }
    }
  }
}
