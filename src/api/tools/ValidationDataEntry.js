// Convierte un string "HH:mm:ss" a formato AM/PM
const AMPM = (horario) => {
  if (!horario) return "";

  // horario esperado "13:45"
  const [hours, minutes] = horario.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

// Valida email con regex
const isValidEmail = (email) => {
  if (!email) return false;
  try {
    const regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
    return regex.test(email);
  } catch {
    return false;
  }
}

// Valida si es número entero
const isInteger = (valor) => {
  return /^[0-9]+$/.test(valor);
}

// Valida que sea string válido
const isValidString = (valor) => {
  if (!valor) return false;
  if (isInteger(valor)) return false;
  if (valor.length < 2) return false;
  // Aquí deberías implementar tu propia lógica para inyección
  if (isInjectionLite(valor, true)) return false;
  return true;
}

// Valida string "com"
const isValidStringCom = (valor) => {
  if (!valor) return false;
  if (isInteger(valor)) return false;
  if (isInjectionLiteCom(valor, true)) return false;
  return true;
}

// Valida teléfono de 10 dígitos
const isTelefono = (valor) => {
  try {
    if (!isInteger(valor)) return false;
    if (valor.length !== 10) return false;
    return true;
  } catch {
    return false;
  }
}

module.exports = {
    AMPM,
    isValidEmail,
    isValidString,
    isValidStringCom,
    isTelefono
};