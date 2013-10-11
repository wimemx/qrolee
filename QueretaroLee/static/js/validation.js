var valid_form = false;
$(document).ready(function(){

    $('.input_val').keyup(function(){
        if($(this).val().length>0)
            $(this).parent().find('.invalid_messa').remove();
    });

    $('form').attr('autocomplete', 'off');
    $('.pass_match').keyup(function(){
        if($(this).val()!=$('.pass').val()){
            var span = $('<span class="invalid">No coincide tu contraseña</span>');
            $(this).parent().append(span);
            $(this).parent().find('.invalid').fadeIn(300);
        }else{
            $(this).parent().find('.invalid').fadeOut(300,function(){
                $(this).remove();
            });
        }
    });

    $('form').submit(function(e){
        var required = $(this).find('p').find('.required').length;
        var valid = required;
        $(this).find('p').each(function(){
            if(!$(this).hasClass('submit')){
                $(this).find('.invalid').remove();
                if($(this).find('input').hasClass('required') &&
                     $.trim($(this).find('input').val()) == ''){
                        valid--;
                        var span = $('<span class="invalid"></span>');
                        var value = 'Ingrese su ';

                        if ($.trim($(this).find('input').attr('name')) != 'password_match'){

                            var text = '';

                            if($.trim($(this).find('input').attr('name')) == 'username')
                                text = 'usuario';

                            if($.trim($(this).find('input').attr('name')) == 'password')
                                text = 'contraseña';

                            if($.trim($(this).find('input').attr('name')) == 'email')
                                text = 'email';

                            value += text;
                        }else{
                            value += 'constraseña nuevamente';
                        }
                        span.html(value);
                        $(this).append(span);
                        $(this).find('.invalid').fadeIn(300);

                }


            }
        });
        $(this).find('[class*="regex_"]').each(function(){
            var regex_classes = $(this).attr('class').split(' ');
            var regex_type = '';
            $.each(regex_classes, function(i){
                if(regex_classes[i].search('regex_') != -1)
                    regex_type = regex_classes[i];
            });
            regex_type = regex_type.split('regex_');
            regex_type = regex_type[1];
            if($.trim($(this).val()) != ''){
                var regex_validation = validate_regex($.trim($(this).val()), regex_type);
                if(!regex_validation[0]){
                    valid--;
                    var span = $('<span class="invalid"></span>');
                    var value = regex_validation[1];
                    span.html(value);
                    $(this).parent().find('.invalid').remove();
                    $(this).parent().append(span);
                    $(this).parent().find('.invalid').fadeIn(300);
                }
            }
        });
        if($.trim($(this).find('.match:eq(0)').val()) !=
            $.trim($(this).find('.match:eq(1)').val())){
            valid--;
            var span = $('<span class="invalid">contraseña incorrecta</span>');
            $('.match').append(span);
            $(this).find('.invalid').fadeIn(300);
        }
        if($('.select_value').length > 0 ){
            if($('.select_value.active').length < 1){
                    valid--;
                    var span = $('<span class="invalid"></span>');
                    var value = 'Favor de escoger una categoria';
                    span.html(value);
                    $('.select_value').parent().parent().parent().find('.invalid').remove();
                    $('.select_value').parent().parent().parent().append(span);
                    $('.select_value').parent().parent().parent().find('.invalid').fadeIn(300);
            }
        }

        if(valid != required)
            e.preventDefault();
        else
            valid_form = true;
    });


    $('.d-add_book').click(function(){

        var query = ' ';
        var type = 0;

        if($(this).find('input').val() == 'title')
            type = 1;
        if($(this).find('.list_typ').val() == 'list')
            type = 4;

        crsf = $('.csrf_header').find('input').val();

        if($(this).find('.add_type').val() == 'add')
            type_add_list(crsf, type, query);
        if($(this).find('.add_type').val() == 'edit')
            type_add_list(crsf, type, query);

    });

});

function type_add_list(csrf, id ,query){

    var data = [];
    var model = '';
    var fields;
    var and = 0;
    var join;
    var _query;

    var type = 'T';

    if($('.d_type_list').length > 0)
        type = $('.d_type_list').val();
    if($('.type_list').length > 0)
        type = $('.type_list').val();


    if(type =='A'){

        model = 'account.author';
        fields = ['name','id','picture','id_api'];
        and = 0;
        join = {
                'tables':{
                    0: JSON.stringify(['account.title','account.authortitle']),
                    1: JSON.stringify(['account.rate'])

                },
                'quieres':{
                    0: JSON.stringify(['author_id']),
                    1: JSON.stringify(['element_id'])
                },
                'fields':{
                    0: JSON.stringify(['title']),
                    1: JSON.stringify(['grade'])
                },
                'activity':{
                    0:JSON.stringify(['A'])
                }
            }
    }
    if(type == 'T'){
        model = 'account.title';
        fields = ['title', 'cover', 'id','id_google'];
        and = 0;
        join = {
            'tables':{
                0: JSON.stringify(['account.author','account.authortitle']),
                1: JSON.stringify(['account.rate'])
            },
            'quieres':{
                0: JSON.stringify(['title_id']),
                1: JSON.stringify(['element_id'])
            },
            'fields':{
                0: JSON.stringify(['name']),
                1: JSON.stringify(['grade'])
            },
            'activity':{
                0:JSON.stringify(['T'])
            }
        }
    }

    //'pk__in': JSON.stringify([127, 126])
    if(id==1){
        if(type == 'T'){
            _query = {
            'title__icontains':' '
        }
        }else{
            _query = {
                'name__icontains': query
                }
        }
    }
    if(id==2 | id == 4 | id == 5){
        if(type == 'T'){
             _query = {
                'title__icontains':query
            }
        }else{
            _query = {
                'name__icontains': query
                }
        }
    }
        join = JSON.stringify(join);
        var search = {
            'type': model,
            'fields': JSON.stringify(fields),
            'value': JSON.stringify(_query),
            'and': and,
            'join': join
            }
        search = JSON.stringify(search);
        data.push(advanced_search(search, csrf));
        if(id==2 | id==4 | id==5){

            query = query.split(" ");
            var __query = {
                'q': JSON.stringify(query),
                'start_index':{
                    0: 0
                },
                'type': {
                    0: model
                }
            };
            data.push(search_api(crsf, __query));
        }


        if(id==1)
            dialog_titles(csrf,data,1);
        if(id==2)
            list_title(csrf,data,$('.dialog_text'),3);
        if(id==3)
            dialog_titles(csrf,data,2);
        if(id==4)
            dialog_titles(csrf,data,4);
        if(id==5)
            list_title(csrf,data,$('.dialog_text'),4);
}



function closet($ele){

  $ele.click(function(e) {
        $('.dialog-confirm').fadeOut(250);
        $('.container_message').fadeOut(250);
    });

}

var url_regex = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/;
var alpha_numeric_regex = /[^a-zA-Z0-9\.\-áéíóúñÁÉÍÓÚÑ()\s]+/;
var numeric_regex = /[\d]+/;
var alpha_regex = /[0-9]+/;
var time_regex = /([0-9]{2}[:]){2}[0-9]{2}/;
var social_regex = /[\W]+/;


function validate_regex(input, type){
    var ret = new Array();
    ret.push(false);
    ret.push('');
    if (type == 'numeric'){
        if(input.search(numeric_regex) == -1)
            ret[0] = true;
        ret[1] = 'Debe ser un valor numerico';
    }else if(type == 'alpha'){
        if(input.search(alpha_regex) == -1)
            ret[0] = true;
        ret[1] = 'Debe ser un valor de caracteres';
    }else if (type == 'alpha_numeric'){
        if(input.search(alpha_numeric_regex) == -1)
            ret[0] = true;
        ret[1] = 'Debe ser un valor alpha numerico';
    }else if(type == 'hh:mm:ss'){

    }else if(type == 'url'){
        if(input.search(url_regex) != -1)
            ret[0] = true;
        ret[1] = 'Debe ser una url valida';
    }else if(type == 'social'){
        if(input.search(social_regex) == -1)
                ret[0] = true;
        ret[1] = 'Solo el usario, no incluya "@ o /"';
    }
    return ret;
}

function selec_item(){
    $('.selec_item').click(function(){
        if(parseInt($(this).find('input').val())==0){
            $(this).addClass('active_item');
            $(this).find('input').val(1);
        }else{
            $(this).removeClass('active_item');
            $(this).find('input').val(0);
        }
    });

}

function aling_message(){
    $('.dialog-confirm').css({'left':'50%'});
    var witdh = parseInt($('.dialog_text').css('width'));
    var left = parseInt($('.dialog-confirm').css('left'));
    $('.dialog-confirm').css({'left':(left-(parseInt(witdh/2)))});
}

function fb_session(){


}

function invalid_f(form){
    var invalid = true;
    $('.invalid_messa').remove();

    var names = {
        'name':'nombre',
        'coment':'contenido',
        'tags':'etiquetas'
    }
    form.find('textarea').each(function(i){
        if($(this).val().length<1){
            var span = $('<span class="invalid_messa" ></span>');
            span.append('Agrega ' + names[$(this).attr('name')] + ' a tu página');
            $(this).parent().append(span);
            invalid = false;
        }
    });
    form.find('p input').each(function(i){
        if($(this).attr('type')=='text'){
            if($(this).val().length<1){
                var span = $('<span class="invalid_messa" ></span>');
                span.append('Agrega ' + names[$(this).attr('name')] + ' a tu página' );
                $(this).parent().append(span);
                invalid = false;
            }
        }
    });
    $('.invalid_messa').fadeIn(250);

    if(invalid)
        return true;
    else
        return false;
}