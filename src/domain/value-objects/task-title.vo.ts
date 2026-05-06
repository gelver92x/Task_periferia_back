export class TaskTitle {
  private constructor(private readonly value: string) {}

  static create(title: string): TaskTitle {
    const normalizedTitle = title.trim();

    if (normalizedTitle.length < 3 || normalizedTitle.length > 100) {
      throw new Error('Task title must be between 3 and 100 characters.');
    }

    return new TaskTitle(normalizedTitle);
  }

  toString(): string {
    return this.value;
  }
}
