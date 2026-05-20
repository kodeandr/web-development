const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'super-secret-key-2024'; // общий секретный ключ

// Хранилище пользователей в памяти (для простоты)
let users = [
  {
    id: 1,
    login: 'admin',
    // пароль "admin123" захэширован заранее
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin'
  }
];

app.use(cors());
app.use(express.json());

// Регистрация нового пользователя
app.post('/register', async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ message: 'Логин и пароль обязательны' });
  }

  const existingUser = users.find(u => u.login === login);
  if (existingUser) {
    return res.status(409).json({ message: 'Пользователь с таким логином уже существует' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length + 1,
    login,
    passwordHash: hashedPassword,
    role: 'admin'
  };
  users.push(newUser);
  res.status(201).json({ message: 'Пользователь успешно создан' });
});

// Вход и получение JWT
app.post('/login', async (req, res) => {
  const { login, password } = req.body;
  const user = users.find(u => u.login === login);
  if (!user) {
    return res.status(401).json({ message: 'Неверный логин или пароль' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Неверный логин или пароль' });
  }

  const payload = { userId: user.id, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  res.json({ token, user: { id: user.id, login: user.login, role: user.role } });
});

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});