var valid_form = false;

$(document).ready(function(){

    $('#form_member').submit(function(e){
        $('.dialog-confirm').empty();
        e.preventDefault();
        $this_ = $(this);
        span_text = $('<span></span>');
        var href = '';
        text = '¿ Estas seguro de que deseas dejar de seguir '+
            $('.d-name_ent').val() +'?';
        p_text = $('<p class="p_text_dialog">' + text + '</p>');
        span_text.append(p_text);
        div_closet = $('<span class="dialog_closet"></span>');
        div_text = $('<div class="dialog_text grid-6 no-margin"></div>');
        btn_cancel = $('<span class="dialog_btn_cancel dialog_btn">Cancelar</span>');
        btn_acept = $('<a class="dialog_btn green_btn" >Aceptar</a>');
        container_btn = $('<div class="dialog_container_btn"></div>');
        $('.dialog-confirm').append(div_text);
        div_text.append(div_closet);
        div_text.append(span_text);
        span_text.append(btn_acept);
        span_text.append(btn_cancel);
        $('.dialog-confirm').fadeIn(250);
        $('.container_message_2').fadeIn(250);
        closet(div_closet);
        closet(btn_cancel);
        aling_message();
        btn_acept.click(function(){
           removeUser($(this),parseInt($('.sesion_user').val()),3,$('.d-entity_id').val());
           $('.container_message_2').fadeOut(250);
            //window.location.href = site_url + '/qro_lee/entity/group/'+$('.id_group_red').val();
            $this_.unbind('submit').submit();
        });
    });

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
                if($(this).find('input, textarea').hasClass('required') &&
                     $.trim($(this).find('input, textarea').val()) == ''){
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
                            value += 'contraseña nuevamente';
                        }
                        span.html(value);
                        $(this).find('input, textarea').css({
                            'border': '1px solid #f89883'
                        });
                        //$(this).append(span);
                        //$(this).find('.invalid').fadeIn(300);

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
                    $(this).css({
                            'border': '1px solid #f89883'
                        });
                    $(this).parent().find('.invalid').remove();
                    //$(this).parent().append(span);
                    //$(this).parent().find('.invalid').fadeIn(300);
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
                    //$('.select_value').parent().parent().parent().find('.invalid').remove();
                    //$('.select_value').parent().parent().parent().append(span);
                    //$('.select_value').parent().parent().parent().find('.invalid').fadeIn(300);
                    $('.select_value').parent().css({
                            'border': '1px solid #f89883'
                        });
            }
        }

        if(valid != required){
            e.preventDefault();
            $('html,body').animate({
                scrollTop: 0
            }, 1000);
        }
        else
            valid_form = true;
    });

});

function type_add_list(csrf, id ,query){

    var type = 'T';

    if($('.d_type_list').length > 0)
        type = $('.d_type_list').val();
    if($('.type_list').length > 0)
        type = $('.type_list').val();
    var data = search_titles_and_author_in_api_bd(type, csrf, query);
    switch (id){
        case 1:
            dialog_titles(csrf,data,1);
            break;
        case 2:
            list_title(csrf,data,$('.dialog_text'),3);
            break;
        case 3:
            dialog_titles(csrf,data,2);
            break;
        case 4:
            dialog_titles(csrf,data,4);
            break;
        case 5:
            list_title(csrf,data,$('.dialog_text'),4);
            break;
    }

}



function closet($ele){

  $ele.click(function(e) {
        $('.dialog-confirm').fadeOut(250);
        $('.container_message').fadeOut(250);
    });

}

var url_regex = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/;
var alpha_numeric_regex = /[^a-zA-Z0-9\.\-áéíóúñÁÉÍÓÚÑ:()\s]+/;
var numeric_regex = /[\d]+/;
var alpha_regex = /[0-9]+/;
var time_regex = /([0-9]{2}[:]){2}[0-9]{2}/;
var social_regex = /^[a-zA-Z0-9\-_\.]+$/;
var email_regex = /(\w[-._\w]*\w@\w[-._\w]*\w\.\w{2,3})/;


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
        if(input.search(social_regex) == 0)
                ret[0] = true;
        ret[1] = 'Solo el usuario, no incluya "@ o /"';
    }else if(type == 'email'){
        if(input.search(email_regex) == 0)
            ret[0] = true;
        ret[1] = 'Debe ser un correo valido';
    }
    return ret;
}

function selec_item(list_titles){
    $('.selec_item').click(function(){

        if(parseInt($(this).find('input').val())==0){
            $(this).addClass('active_item');
            $(this).find('input').val(1);
            var $item = $(this).parent();
            add_titles_dictionary($item, list_titles, 2);
        }else{
            $(this).removeClass('active_item');
            $(this).find('input').val(0);
            var $item = $(this).parent();
            var it = $item.find('.id_t').val();
            delete dict_titles[it];
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
        'name': 'nombre',
        'coment': 'contenido',
        'tags': 'etiquetas'
    }
    if (tinyMCE) tinyMCE.triggerSave();
    form.find('textarea').each(function(i){
        if($(this).val().length < 1){
            var span = $('<span class="invalid_messa" ></span>');
            span.append('Agrega ' + names[$(this).attr('name')] + ' a tu página');
            $(this).parent().append(span);
            invalid = false;
        }
    });
    form.find('p input').each(function(i){
        if($(this).attr('type') == 'text'){
            if($(this).val().length < 1){
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

function valid_form_list(form){
    $('.container_message_2').fadeOut(300);
    $('.invalid').remove();
    var succe = true;
    if(form.find('input[name=name]').val().length==0){

        succe = false;
    }

    if($('.add_my_list .d-item_book').length==0){
        $('.container_message_2').fadeIn(300);
        $('.accept_messa').click(function(){
            $('.container_message_2').fadeOut(300);
        });
        succe = false
    }
    return succe;
}

function valid_course($form){
    var no_contents = false;
    var form = true;
    $('.no_resuls').remove();
    var text = $('<div class="grid-14 no_resuls"></div>');

    if($('.seccion .item-mod').length == 1){
        text.text('El curso debe tener al menos un módulo');
        $('.seccion').append(text);
        form = false;
    }

    $.each($('.seccion .item-mod'),function(){
        if(!$(this).hasClass('one'))
            if($(this).find('.item_content').length == 1)
                no_contents = true;
    });

    if(no_contents){
        text.text('Cada módulo debe tener al menos un tema');
        $('.seccion').append(text);
        form = false;
    }

    var name = $form.find('input[name=name]').val();
    var desc = $form.find('textarea[name=Description]').val();

    if(name.length == 0 || desc.length == 0)
        form = false;

    return form;
}

function valid_content(){
    var ok = true;
    var text = $('.create_content .textarea_page').val();
    var name = $('.create_content .name').val();
    $('.create_content .name').css({'border':'1px solid #e4e4e4'});

    if(text.length == 0 || name.length == 0){
        $('.create_content .name').css({'border':'1px solid rgb(248, 152, 131)'});
        ok = false;
    }
    return ok;
}

function valid_module($this){

    var ok = true;
    var name = $this.parent().find('input[name=name]');
    var desc = $this.parent().find('textarea[name=description]');

    name.css({'border': '1px solid #c2baab'});
    if(name.val().length == 0){
        name.css(
            {
                'border': '1px solid rgb(248, 152, 131)'
            });
        ok = false;
    }

    desc.css({'border': '1px solid #c2baab'});
    if(desc.val().length == 0){
        desc.css(
            {
                'border': '1px solid rgb(248, 152, 131)'
            });
        ok = false;
    }

    return ok;
}

function valid_question($this){
    var type = parseInt($this.parent().parent().find('.field_option').val());
    var error = true;
    var field = '';

    if(type == 1){

        field = '.option_b';

    }else{

        var no_check = 0;
        field = '.option_a';
        var count_answer = 0;

        $.each($(field + ' .item-answer'), function(){

            var border = '1px solid rgb(228, 228, 228)';
            if(!$(this).hasClass('answer-one') && $(this).find('.field_').val().length == 0){
                error = false;
                if (count_answer < 3){
                    border = '1px solid rgb(248, 152, 131)';
                }
                count_answer++;
            }
            $(this).find('.field_').css({'border': border});

            if($(this).find('.multi_check').hasClass('active'))
                no_check++;
        });

        if(no_check == 0){
            error = false;
            $('.option_a .lab2').css(
                {
                    'color': '#f89883'
                }
            );
        }else{
            $('.option_a .lab2').css(
                {
                    'color': '#454545'
                }
            );
        }
    }
    $(field + ' .name_c').css({'border': '1px solid #e4e4e4'});
    if($(field + ' .name_c').val().length == 0){
        $(field + ' .name_c').css(
            {
                'border': '1px solid rgb(248, 152, 131)'
            });
        error = false;
    }
    return error;
}

function valid_test(){

    var ok = true;
    var text = $('<div class="grid-14 no_resuls" style="display:none;" >' +
        'Cada prueba debe tener minino una pregunta</div>');

    $('.create_test .name').css({'border': '1px solid #e4e4e4'});
    if($('.create_test .name').val().length == 0){
        $('.create_test .name').css(
            {
                'border': '1px solid rgb(248, 152, 131)'
            });
        ok = false;
    }

    $('.no_resuls').remove();

    if($('.container_cuestion .item_cuestion').length == 1){
        ok = false;
        $('.container_test').append(text);
        text.fadeIn(300);
    }

    return ok;
}