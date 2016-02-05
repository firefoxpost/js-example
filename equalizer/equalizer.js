/* Изменение состава портфеля - эквалайзер */
if ($('.change-shares').length) {
    (function(){

        function Funds(selectedFund) {
            // objects
            this.selectedFund = selectedFund;
            this.shareObj = selectedFund.find(".share-value");
            this.sliderObj = selectedFund.find(".slider-td .slider-element");

            // props
            this.shareValue = parseInt(selectedFund.find(".share-value").val());
            this.priceForOne = parseFloat(varFormat(selectedFund.find(".price-for-one").text()));
            this.quantityValue = parseFloat(varFormat(selectedFund.find(".quantity-value").text()));
            this.totalValue = parseFloat(varFormat(selectedFund.find(".total-value").text()));
        };

        Funds.prototype.enable = function(checkSum, totalValueSum){

            var that = this;
            //enable spinner and set max value
            this.shareObj.removeAttr('disabled');
            this.shareObj.TouchSpin();
            this.shareObj.trigger("touchspin.updatesettings", {max: checkSum});
            this.sliderObj.slider('enable');

            //spinner event
            this.shareObj.off().on("change", function(e) {
                e.stopPropagation();
                that.shareValue = parseInt($(this).val());
                that.sliderObj.slider('setValue', that.shareValue);
                that.calculate(checkSum,totalValueSum);
            });

            // slider event
            this.sliderObj.off().on("change", function (e) {
                //set value & update spinner
                e.stopPropagation();
                if (parseInt(that.sliderObj.slider('getValue'))>checkSum)
                {
                    that.shareValue = checkSum;
                    that.sliderObj.slider('setValue', that.shareValue);
                }
                else{
                    that.shareValue = parseInt(that.sliderObj.slider('getValue'));
                }

                that.shareObj.val(that.shareValue).change();
                that.calculate(checkSum,totalValueSum);
            });
        };

        Funds.prototype.update = function(checkSum, changedVal, totalValueSum) {
            this.shareValue = parseInt(checkSum) - parseInt(changedVal);
            this.sliderObj.slider('setValue', this.shareValue);
            this.shareObj.attr('value', this.shareValue).val(this.shareValue);
            this.calculate(checkSum,totalValueSum);
        };

        Funds.prototype.disable = function() {
            this.shareObj.off();
            this.shareObj.attr('disabled','disabled');
            this.sliderObj.slider('disable');
        };


        Funds.prototype.calculate = function(checkSum,totalValueSum) {
            var percentage = (checkSum==0)?0:parseFloat(totalValueSum)/checkSum;
            this.totalValue = Math.round(parseInt(this.shareValue) * percentage*100)/100;
            this.quantityValue = Math.round(100*this.totalValue/this.priceForOne)/100;
            this.selectedFund.find('.total-value').text(varFormat(this.totalValue)).off();
            this.selectedFund.find('.quantity-value').text(varFormat(this.quantityValue));
            this.markAsRemovable();
        };

        Funds.prototype.markAsRemovable = function(){
            if(this.totalValue == 0){
                $(this.selectedFund).find('.remove').addClass('active');
            }
            else{
                $(this.selectedFund).find('.remove').removeClass('active');
            }
        }

        var tableObj = $('.change-shares tbody tr'),
            projectSlider = $('.slider-element').slider(),
            trObj=[],
            varFormat = function(i){
                if(typeof i == 'number'){
                    i = i.toString();
                    var intNum = i.indexOf('.'),
                        floatNum=".00";
                    if(intNum != -1){
                        floatNum = i.substr(intNum);
                        if(floatNum.length==2){
                            floatNum = floatNum.concat("0");
                        }
                        i = i.substr(0, intNum);
                    }
                    var arr = i.split(''),
                    str_temp = '';
                    if (i.length > 3) {
                        for (var j = arr.length - 1, k = 1; j >= 0; j--, k++) {
                            str_temp = arr[j] + str_temp;
                            if (k % 3 == 0) {
                                str_temp = ' ' + str_temp;
                            }
                        }
                        return str_temp+floatNum;
                    } else {
                        return i+floatNum;
                    }
                }
                else{
                    i = parseInt(i.replace(/\s+/g,""));
                }
                return i;
            };

        // disable sliders
        projectSlider.each(function(){
            $(this).slider("disable");
        });

        // disable spinners
        $('.share-value').attr("disabled","disabled").TouchSpin({
            min: 0,
            max: 100,
            step: 1
        });

        // function for removing

        $(".remove").on('click', function(e){
            e.stopPropagation();
            if ($(this).parents('.removable').hasClass('selected')){

                for (var i=0; i<trObj.length;i++){
                    trObj[i].disable();
                    $(trObj[i].shareObj).off();
                }
                trObj=[];
                tableObj.removeClass("selected");
            }

            $(this).parents('.removable').eq(0).remove();

            // reinit sliders
            projectSlider = $('.slider-element').slider();
        });

        tableObj.off().on('click', function(e) {
            e.stopPropagation();
            if (!$(this).hasClass("selected")) {

                if ($("tr.selected").length >= 2) {
                    tableObj.removeClass("selected");
                    for (var i=0; i<trObj.length;i++){
                        trObj[i].disable();
                        $(trObj[i].shareObj).off();
                    }
                    trObj=[];
                }

                $(this).addClass("selected");

                trObj.push(new Funds($(this)));

                if(trObj.length==2){
                    var checkSum = 0;
                    var totalValueSum = 0;
                    for (var i=0; i<trObj.length;i++){
                        checkSum = checkSum + parseInt(varFormat(trObj[i].shareValue));
                        totalValueSum = totalValueSum + parseFloat(trObj[i].totalValue);
                    }

                    for (var i=0; i<trObj.length;i++){
                        trObj[i].enable(checkSum, totalValueSum);
                    }

                    $(trObj[0].shareObj).on('change', function(){
                        trObj[1].update(checkSum,parseInt(trObj[0].shareValue),totalValueSum);
                    });
                    $(trObj[1].shareObj).on('change', function(){
                        trObj[0].update(checkSum,parseInt(trObj[1].shareValue),totalValueSum);
                    });
                }
            }
        });
    }())
}