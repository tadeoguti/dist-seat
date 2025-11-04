class GetCommercialPromotionsUseCase {
    constructor({ GetCommercialPromotionsRepository }) {
      this.GetCommercialPromotionsRepository = GetCommercialPromotionsRepository;
    }

    async execute(reqDto) {
      return await this.GetCommercialPromotionsRepository.getCommercialPromotions(reqDto);
    }
  }

  module.exports = GetCommercialPromotionsUseCase;