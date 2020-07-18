import { readFileSync } from 'fs';

export function readPackageJson<T>() {
  try {
    return JSON.parse(readFileSync('./package.json').toString()) as T;
  } catch {
    return {} as T;
  }
}