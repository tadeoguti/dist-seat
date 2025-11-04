class CatMarcaKeyEntity {
    constructor({ masID }) {
      this.id = 0;
      this.masID = masID;
      this.APIKey = "";
      this.fecAlta = new Date();
      this.status = false;
    }
  }