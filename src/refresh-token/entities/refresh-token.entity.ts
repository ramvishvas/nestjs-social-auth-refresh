import { AbstractEntity } from 'src/library/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { PrimaryGeneratedColumn } from 'typeorm';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class RefreshToken extends AbstractEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  refreshToken: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'text', nullable: true })
  userAgent: string; // Optional: Store device or browser info

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string; // Optional: Store IP address

  @ManyToOne(() => User, (user) => user.refreshTokens, {
    eager: false,
    onDelete: 'CASCADE',
  })
  user: User;
}
