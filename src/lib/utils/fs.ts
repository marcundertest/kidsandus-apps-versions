import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { GithubStorage } from './github-storage';

export function getDataPath(): string {
  if (process.env.NODE_ENV === 'production') {
    return path.join(os.tmpdir(), 'data.json');
  }
  return path.join(process.cwd(), 'data.json');
}

export async function readData<T>(): Promise<T | null> {
  // In production, use GitHub Storage (read-only filesystem workaround)
  if (process.env.NODE_ENV === 'production') {
    const storage = new GithubStorage();
    return storage.fetchData<T>();
  }

  // Local development
  try {
    const dataPath = getDataPath();
    const content = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(content) as T;
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'ENOENT') return null;
    throw error;
  }
}

export async function writeData(data: unknown): Promise<void> {
  // In production, use GitHub Storage (read-only filesystem workaround)
  if (process.env.NODE_ENV === 'production') {
    const storage = new GithubStorage();
    await storage.saveData(data);
    return;
  }

  // Local development
  const dataPath = getDataPath();
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
}
