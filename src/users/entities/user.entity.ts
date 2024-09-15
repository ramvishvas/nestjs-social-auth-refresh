import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { RolesEnum } from '../enums/roles.enum';
import { Exclude } from 'class-transformer';
import { AbstractEntity } from 'src/library/entities/base.entity';
import { RefreshToken } from 'src/refresh-token/entities/refresh-token.entity';

@Entity()
@Unique(['email'])
export class User extends AbstractEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'enum', enum: RolesEnum, nullable: true })
  role: RolesEnum | null;

  @Column({ type: 'timestamptz', nullable: true })
  isEmailConfirmed: Date | null;

  @Exclude()
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    eager: false,
    onDelete: 'CASCADE',
    nullable: true,
  })
  refreshTokens: RefreshToken[] | null;
}
