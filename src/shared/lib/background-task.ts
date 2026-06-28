import { after } from 'next/server';

export function runInBackground(task: Promise<unknown>) {
  try {
    after(() => task);
    return;
  } catch {}

  Promise.resolve().then(() => task);
}
