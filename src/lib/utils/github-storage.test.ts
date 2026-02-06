import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GithubStorage } from './github-storage';

// Mock Octokit class
const mockGetContent = vi.fn();
const mockCreateOrUpdate = vi.fn();

vi.mock('octokit', () => {
  return {
    Octokit: vi.fn().mockImplementation(function () {
      return {
        rest: {
          repos: {
            getContent: mockGetContent,
            createOrUpdateFileContents: mockCreateOrUpdate,
          },
        },
      };
    }),
  };
});

// Mock process.env
const originalEnv = process.env;

describe('GithubStorage', () => {
  let storage: GithubStorage;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      GITHUB_TOKEN: 'fake-token',
      GITHUB_OWNER: 'fake-owner',
      GITHUB_REPO: 'fake-repo',
    };
    storage = new GithubStorage();
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env = originalEnv;
  });

  it('fetchData returns parsed JSON on success', async () => {
    const mockContent = JSON.stringify({ key: 'value' });
    const mockBase64 = Buffer.from(mockContent).toString('base64');

    mockGetContent.mockResolvedValue({
      data: {
        content: mockBase64,
      },
    });

    const result = await storage.fetchData<{ key: string }>();
    expect(result).toEqual({ key: 'value' });
  });

  it('fetchData returns null on 404', async () => {
    mockGetContent.mockRejectedValue({ status: 404 });

    const result = await storage.fetchData();
    expect(result).toBeNull();
  });

  it('saveData creates/updates file successfully', async () => {
    // 1. Mock GET (to check existence/SHA) - let's say it exists
    mockGetContent.mockResolvedValue({
      data: {
        sha: 'old-sha',
        content: '',
      },
    });

    // 2. Mock PUT (save)
    mockCreateOrUpdate.mockResolvedValue({ status: 200 });

    await storage.saveData({ new: 'data' });

    expect(mockCreateOrUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        sha: 'old-sha',
        message: expect.stringContaining('chore'),
      })
    );
  });

  it('saveData retries on 409 conflict', async () => {
    // 1. First GET (initial SHA)
    mockGetContent.mockResolvedValue({ data: { sha: 'sha-1' } });

    // 2. First PUT -> Fails with 409
    mockCreateOrUpdate.mockRejectedValueOnce({ status: 409 });

    // 3. Second PUT (Retry) -> Succeeds
    mockCreateOrUpdate.mockResolvedValueOnce({ status: 200 });

    // Note: The logic inside saveData re-fetches SHA on retry?
    // Looking at the code: "while (currentRetry < retries) ... try { getSha ... save ... }"
    // So yes, it should call mocked GetContent again. So we need to mock GetContent to return potentially new SHA.

    await storage.saveData({ retry: 'test' });

    // Should have tried to save at least twice
    expect(mockCreateOrUpdate).toHaveBeenCalledTimes(2);
  });
});
