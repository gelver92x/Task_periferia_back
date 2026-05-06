import { TaskDescription } from '../value-objects/task-description.vo';
import { type TaskStatus } from '../value-objects/task-status.vo';
import { TaskTitle } from '../value-objects/task-title.vo';

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

export class Task {
  private constructor(
    private readonly _id: string,
    private _title: TaskTitle,
    private _description: TaskDescription,
    private _status: TaskStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title.toString();
  }

  get description(): string {
    return this._description.toString();
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
      TaskTitle.create(props.title),
      TaskDescription.create(props.description),
      props.status ?? 'pending',
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  static rehydrate(snapshot: TaskSnapshot): Task {
    return new Task(
      snapshot.id,
      TaskTitle.create(snapshot.title),
      TaskDescription.create(snapshot.description),
      snapshot.status,
      snapshot.createdAt,
      snapshot.updatedAt,
    );
  }

  rename(title: string): void {
    this._title = TaskTitle.create(title);
    this.touch();
  }

  updateDescription(description?: string): void {
    this._description = TaskDescription.create(description);
    this.touch();
  }

  changeStatus(status: TaskStatus): void {
    this._status = status;
    this.touch();
  }

  toSnapshot(): TaskSnapshot {
    return {
      id: this._id,
      title: this._title.toString(),
      description: this._description.toString(),
      status: this._status,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}

