class GetPromotionsUseCase {
    constructor({ GetPromotionsRepository }) {
      this.GetPromotionsRepository = GetPromotionsRepository;
    }

    async execute(reqDto) {
      return await this.GetPromotionsRepository.getPromotions(reqDto);
    }
  }

  module.exports = GetPromotionsUseCase;