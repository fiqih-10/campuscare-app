const mysql = require('mysql2/promise');

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({ host: 'localhost', user: 'root', password: '' });
    await connection.query('CREATE DATABASE IF NOT EXISTS campuscare;');
    console.log('Database campuscare created or already exists.');
    await connection.end();
  } catch (err) {
    console.error('Failed to create database. Is MySQL running?', err);
  }
}
createDatabase();
