import React, { useState } from 'react';

const PASSWORD_KEY = 'auth_password';
const CORRECT_PASSWORD = 'o9Im6nPIvksizbV1'; // Şifrenizi burada belirleyin

const SingIn = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem(PASSWORD_KEY, password);
      onAuthenticated();
    } else {
      setError('Yanlış şifre!');
    }
  };

  return (
    <div className="password-prompt">
      <form onSubmit={handlePasswordSubmit}>
        <div className="form-group">
          <label>Şifre:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            required
          />
        </div>
        {error && <p className="text-danger">{error}</p>}
        <button type="submit" className="btn btn-primary">Giriş</button>
      </form>
    </div>
  );
};

export default SingIn;