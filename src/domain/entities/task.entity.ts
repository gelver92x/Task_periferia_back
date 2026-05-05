import { type TaskStatus } from '../value-objects/task-status.vo';

export type TaskSnapshot = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTaskProps = {
  id: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TaskDTO = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export class Task {
  private constructor(
    private readonly _id: string,
    private _title: string,
    private _description: string,
    private _status: TaskStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get status(): TaskStatus {
    return this._status;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  static create(props: CreateTaskProps): Task {
    const now = new Date();

    return new Task(
      props.id,
      Task.normalizeTitle(props.title),
      Task.normalizeDescription(props.description),
      props.status ?? 'pending',
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  static rehydrate(snapshot: TaskSnapshot): Task {
    return new Task(
      snapshot.id,
      Task.normalizeTitle(snapshot.title),
      Task.normalizeDescription(snapshot.description),
      snapshot.status,
      snapshot.createdAt,
      snapshot.updatedAt,
    );
  }

  rename(title: string): void {
    this._title = Task.normalizeTitle(title);
    this.touch();
  }

  updateDescription(description?: string): void {
    this._description = Task.normalizeDescription(description);
    this.touch();
  }

  changeStatus(status: TaskStatus): void {
    this._status = status;
    this.touch();
  }

  toSnapshot(): TaskSnapshot {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      status: this._status,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }

  toJSON(): TaskDTO {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      status: this._status,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  private static normalizeTitle(title: string): string {
    const normalizedTitle = title.trim();

    if (normalizedTitle.length < 3 || normalizedTitle.length > 100) {
      throw new Error('Task title must be between 3 and 100 characters.');
    }

    return normalizedTitle;
  }

  private static normalizeDescription(description = ''): string {
    const normalizedDescription = description.trim();

    if (normalizedDescription.length > 500) {
      throw new Error('Task description must be 500 characters or less.');
    }

    return normalizedDescription;
  }
}

