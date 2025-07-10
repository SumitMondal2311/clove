import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../../src/server';

describe('Auth endpoints', () => {
    const testUser = {
        email: 'test@test.com',
        password: 'Clove?2025',
    };

    // - - - - - signup endpoint - - - - - //

    it('should not allow invalid email', async () => {
        const res = await request(app).post('/api/auth/signup').send({
            email: 'test@test',
            password: testUser.password,
        });

        expect(res.body.message).toBe('Invalid email');
        expect(res.statusCode).toBe(400);
    });

    it('should not allow invalid password', async () => {
        const res = await request(app).post('/api/auth/signup').send({
            email: testUser.email,
            password: '',
        });

        expect(res.body.message).toBe('Password is required');
        expect(res.statusCode).toBe(400);
    });

    it('should signup a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .set('user-agent', 'vitest')
            .send(testUser);

        expect(res.body.user.email).toBe(testUser.email);
        expect(res.body.accessToken).toBeDefined();
        expect(res.headers['set-cookie']).toBeDefined();
        expect(res.statusCode).toBe(201);
    });

    it('should not allow if same account already exists', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .set('user-agent', 'vitest')
            .send(testUser);

        expect(res.body.message).toBe('Account already exists');
        expect(res.statusCode).toBe(409);
    });

    // - - - - - login endpoint - - - - - //

    it('should not allow invalid email', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'test@test',
            password: testUser.password,
        });

        expect(res.body.message).toBe('Invalid email');
        expect(res.statusCode).toBe(400);
    });

    it('should not allow invalid password', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: testUser.email,
            password: '',
        });

        expect(res.body.message).toBe('Password is required');
        expect(res.statusCode).toBe(400);
    });

    it('should login an existing user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .set('user-agent', 'vitest')
            .send(testUser);

        expect(res.body.user.email).toBe(testUser.email);
        expect(res.body.accessToken).toBeDefined();
        expect(res.headers['set-cookie']).toBeDefined();
        expect(res.statusCode).toBe(200);
    });
});
