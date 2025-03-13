type FileSystemObserverRecord =
  | { root: FileSystemDirectoryHandle, relativePathComponents: string[], type: 'appeared', changedHandle: FileSystemFileHandle | FileSystemDirectoryHandle }
  | { root: FileSystemDirectoryHandle, relativePathComponents: string[], type: 'disappeared', changedHandle: null }
  | { root: FileSystemDirectoryHandle, relativePathComponents: string[], type: 'modified', changedHandle: FileSystemFileHandle | FileSystemDirectoryHandle }
  | { root: FileSystemDirectoryHandle, relativePathComponents: string[], type: 'moved', changedHandle: FileSystemFileHandle | FileSystemDirectoryHandle, relativePathMovedFrom: string[] }
  | { root: FileSystemDirectoryHandle, relativePathComponents: string[], type: 'unknown', changedHandle: null }
  | { root: FileSystemDirectoryHandle, relativePathComponents: string[], type: 'errored', changedHandle: null }

declare class FileSystemObserver {
  constructor(callback: (records: FileSystemObserverRecord[], observer: FileSystemObserver) => void)
  observe(fileHandle: FileSystemHandle): void
  observe(fileHandle: FileSystemDirectoryHandle, options?: { recursive: boolean }): void
  private unobserve(fileHandle: FileSystemHandle): void
  disconnect(): void
}
