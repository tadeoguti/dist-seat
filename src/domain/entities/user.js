class UserEntity {
  constructor({ id, name, email }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.validate();
  }

  validate() {
    if (!this.name || this.name.length < 3) {
      throw new Error("El nombre debe tener al menos 3 caracteres.");
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error("El email no es válido.");
    }
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

module.exports = UserEntity;