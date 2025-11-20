export const validatePasswordStrength = (password) => {
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const strength = Object.values(criteria).filter(Boolean).length;

  return {
    criteria,
    strength,
    isStrong: strength >= 4,
    message: 
      strength <= 1 ? 'Muy débil' :
      strength === 2 ? 'Débil' :
      strength === 3 ? 'Normal' :
      strength === 4 ? 'Fuerte' :
      'Muy fuerte',
    color:
      strength <= 1 ? '#EF5350' :
      strength === 2 ? '#FFA726' :
      strength === 3 ? '#FFC107' :
      strength === 4 ? '#66BB6A' :
      '#2E7D32'
  };
};
