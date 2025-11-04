class LoadInfoDistributorPayloadUseCase {
    constructor({ DistributorRepository }) {
      this.DistributorRepository = DistributorRepository;
    }

    async execute(reqDistributorDto) {
      return await this.DistributorRepository.getInfoDistributor(reqDistributorDto);
    }
  }

  module.exports = LoadInfoDistributorPayloadUseCase;