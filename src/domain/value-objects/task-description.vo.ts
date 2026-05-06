export class TaskDescription {
  private constructor(private readonly value: string) {}

  static create(description = ''): TaskDescription {
    const normalizedDescription = description.trim();

    if (normalizedDescription.length > 500) {
      throw new Error('Task description must be 500 characters or less.');
    }

    return new TaskDescription(normalizedDescription);
  }

  toString(): string {
    return this.value;
  }
}
