import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

/**
 * Abstract base entity class providing common columns for entities.
 *
 * @abstract
 */
export abstract class AbstractEntity extends BaseEntity {
  /**
   * Unique identifier for the entity.
   */
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Timestamp when the entity was created.
   */
  @Exclude()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  /**
   * Timestamp when the entity was last updated.
   */
  @Exclude()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  /**
   * Timestamp when the entity was soft-deleted.
   * Nullable to indicate that the entity might not be deleted.
   */
  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null; // Changed from optional type `Date?` to `Date | null`
}
