import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe(registerDto.email);
          expect(res.body.user.username).toBe(registerDto.username);
          expect(res.body.user).not.toHaveProperty('passwordHash');
        });
    });

    it('should return 400 when passwords do not match', () => {
      const registerDto = {
        email: 'test2@example.com',
        username: 'testuser2',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
        firstName: 'Test',
        lastName: 'User',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should return 400 when email is invalid', () => {
      const registerDto = {
        email: 'invalid-email',
        username: 'testuser3',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should return 400 when required fields are missing', () => {
      const registerDto = {
        email: 'test4@example.com',
        // Missing username, password, etc.
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      // First register a user
      const registerDto = {
        email: 'login@example.com',
        username: 'loginuser',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        firstName: 'Login',
        lastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      // Then login
      const loginDto = {
        email: 'login@example.com',
        password: 'SecurePass123!',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe(loginDto.email);
          expect(res.body.user).not.toHaveProperty('passwordHash');
        });
    });

    it('should return 401 with invalid credentials', () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('should return 400 when required fields are missing', () => {
      const loginDto = {
        email: 'test@example.com',
        // Missing password
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(400);
    });
  });

  describe('/auth/profile (GET)', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Register and login a user to get a token
      const registerDto = {
        email: 'profile@example.com',
        username: 'profileuser',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        firstName: 'Profile',
        lastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'profile@example.com',
          password: 'SecurePass123!',
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should return user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('username');
          expect(res.body).toHaveProperty('firstName');
          expect(res.body).toHaveProperty('lastName');
          expect(res.body).not.toHaveProperty('passwordHash');
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should return 401 with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/change-password (PATCH)', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Register and login a user to get a token
      const registerDto = {
        email: 'changepass@example.com',
        username: 'changepassuser',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        firstName: 'Change',
        lastName: 'Password',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'changepass@example.com',
          password: 'SecurePass123!',
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should change password successfully', () => {
      const changePasswordDto = {
        currentPassword: 'SecurePass123!',
        newPassword: 'NewSecurePass123!',
        confirmNewPassword: 'NewSecurePass123!',
      };

      return request(app.getHttpServer())
        .patch('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(changePasswordDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Password changed successfully');
        });
    });

    it('should return 400 when passwords do not match', () => {
      const changePasswordDto = {
        currentPassword: 'NewSecurePass123!',
        newPassword: 'AnotherNewPass123!',
        confirmNewPassword: 'DifferentNewPass123!',
      };

      return request(app.getHttpServer())
        .patch('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(changePasswordDto)
        .expect(400);
    });

    it('should return 401 without token', () => {
      const changePasswordDto = {
        currentPassword: 'NewSecurePass123!',
        newPassword: 'AnotherNewPass123!',
        confirmNewPassword: 'AnotherNewPass123!',
      };

      return request(app.getHttpServer())
        .patch('/auth/change-password')
        .send(changePasswordDto)
        .expect(401);
    });
  });
});
