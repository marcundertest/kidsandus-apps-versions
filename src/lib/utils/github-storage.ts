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

  async saveData(content: unknown, message: string = 'Update data.json via App'): Promise<void> {
    try {
      // 1. Get current SHA (required for update)
      let sha: string | undefined;
      try {
        const { data: currentFile } = await this.octokit.rest.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path: this.config.path,
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
        committer: {
          name: 'Kids&Us App',
          email: 'app@kidsandus.local', // Github will use the authenticated user's email if not specified, or this dummy one
        },
      });

      console.log('GithubStorage: Saved successfully');
    } catch (error) {
      console.error('GithubStorage: Error saving data', error);
      throw error;
    }
  }
}
