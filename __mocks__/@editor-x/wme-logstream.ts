export class LogStream {
  static create() {
    return new LogStream();
  }
  scope() {
    return this;
  }
  trace() {}
  debug() {}
  info() {}
  warn() {}
  error() {}
  fatal() {}
  stateDelta() {}
  createStateTracker() {
    return () => {};
  }
  exportLogs() {
    return Promise.resolve(new Blob());
  }
  downloadLogs() {
    return Promise.resolve();
  }
  flush() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
}
