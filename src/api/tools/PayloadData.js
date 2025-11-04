const getDataPayload = (dto,req) => {
    if(req.method=='GET'){
        dto.MasID = (req.query.MasID == undefined || req.query.MasID == null || req.query.MasID == "") ? req.user.masID : req.query.MasID;
        dto.Url = (req.query.Url == undefined || req.query.Url == null || req.query.Url == "") ? req.user.url : req.query.Url;
        dto.Marca = (req.query.Marca == undefined || req.query.Marca == null || req.query.Marca == "") ? req.user.marca : req.query.Marca;
        dto.MasID2 = (req.query.MasID2 == undefined || req.query.MasID2 == null || req.query.MasID2 == "") ? req.user.masID2 : req.query.MasID2;
        dto.MarID = (req.query.MarID == undefined || req.query.MarID == null || req.query.MarID == "") ? req.user.marID : req.query.MarID;
        dto.DisID = (req.query.DisID == undefined || req.query.DisID == null || req.query.DisID == "") ? req.user.disID : req.query.DisID;
        dto.masNombre = (req.query.masNombre == undefined || req.query.masNombre == null || req.query.masNombre == "") ? req.user.masNombre : req.query.masNombre;
    }else{
        dto.MasID = (req.body.MasID == undefined || req.body.MasID == null || req.body.MasID == "") ? req.user.masID : req.body.MasID;
        dto.Url = (req.body.Url == undefined || req.body.Url == null || req.body.Url == "") ? req.user.url : req.body.Url;
        dto.Marca = (req.body.Marca == undefined || req.body.Marca == null || req.body.Marca == "") ? req.user.marca : req.body.Marca;
        dto.MasID2 = (req.body.MasID2 == undefined || req.body.MasID2 == null || req.body.MasID2 == "") ? req.user.masID2 : req.body.MasID2;
        dto.MarID = (req.body.MarID == undefined || req.body.MarID == null || req.body.MarID == "") ? req.user.marID : req.body.MarID;
        dto.DisID = (req.body.DisID == undefined || req.body.DisID == null || req.body.DisID == "") ? req.user.disID : req.body.DisID;
        dto.masNombre = (req.body.masNombre == undefined || req.body.masNombre == null || req.body.masNombre == "") ? req.user.masNombre : req.body.masNombre;
    }

    return dto;
}

module.exports = {
    getDataPayload
};