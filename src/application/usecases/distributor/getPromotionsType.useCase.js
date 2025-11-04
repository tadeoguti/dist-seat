class GetPromotionsTypeUseCase {
    constructor({ GetPromotionsTypeRepository }) {
      this.GetPromotionsTypeRepository = GetPromotionsTypeRepository;
    }

    async execute(reqDto) {
      return await this.GetPromotionsTypeRepository.getPromotionsType(reqDto);
    }
  }

  module.exports = GetPromotionsTypeUseCase;