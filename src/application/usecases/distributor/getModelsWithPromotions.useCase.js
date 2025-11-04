class GetModelsWithPromotionsUseCase {
    constructor({ GetModelsWithPromotionsRepository }) {
      this.GetModelsWithPromotionsRepository = GetModelsWithPromotionsRepository;
    }

    async execute(reqDto) {
      return await this.GetModelsWithPromotionsRepository.getModelsWithPromotions(reqDto);
    }
  }

  module.exports = GetModelsWithPromotionsUseCase;