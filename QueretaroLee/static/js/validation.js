var valid_form = false;
$(document).ready(function(){

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
                if($(this).find('input').hasClass('required')){
                    if($.trim($(this).find('input').val()) == ''){
                        valid--;
                        var span = $('<span class="invalid"></span>');
                        var value = 'Ingrese su ';
                        //console.log($.trim($(this).find('input')).val());
                        if ($.trim($(this).find('input').attr('name')) != 'password_match'){
                            value += $.trim($(this).find('input').attr('name'));
                        }else{
                            value += 'password';
                        }
                        span.html(value);
                        $(this).append(span);
                        $(this).find('.invalid').fadeIn(300);
                    }
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

        if(valid != required)
            e.preventDefault();
        else
            valid_form = true;
    });

    $('.d-add_book').click(function(){
        var query = {
            'q': JSON.stringify(['Harry','Potter']),
            'start_index':{
                0: 0
            }
        };
        type = 0;
        if($(this).find('input').val() == 'title')
            type = 1;
        if($(this).find('input').val() == 'list')
            type = 3;

        search_api($('.csrf_token').find('div input').val(), query, type);

    });

    show_dialog();


});

function show_dialog(){
    $('.message_alert').click(function(e) {

        $('.dialog-confirm').empty();
        span_text = $('<span></span>');
        var href = '';
        var type_list = '';

        if($('.type').val()=="group"){

            text = 'Para poder ser miembro tu solicitud sera enviada';
            p_text = $('<p class="p_text_dialog">' + text + '</p>');
            span_text.append(p_text);
            href = 'href="/registry/join_entity/'+$('.d-entity_id').val()+'"';
        }

        console.log($('.type').val());

        if($('.type').val()=="List"){
            var type = $(this).find('.type_message').val();

            if(type=="out_group"){

                var group = $(this).parent().find('.name').val();
                group = group.split("_");
                text = '¿ Estás seguro de que deseas abandonar el grupo de ' +
                    group[0] + ' ?';
                p_text = $('<p class="p_text_dialog">' + text + '</p>');
                span_text.append(p_text);
                href = 'href="/registry/unjoin_entity/'+ $(this).parent().
                    find('input').val()+'"';
            }

            if(type=="add_genre"){

                text = 'Añadir un nuevo género favorito';
                text2 = 'Selecciona tus géneros favoritos';
                p_text = $('<p class="p_text_dialog">' + text + '</p>');
                p_text2 = $('<p class="p_text_mini">' + text2 + '</p>');
                span_text.append(p_text);
                span_text.append(p_text2);
                href = 'href="/registry/add_genre/"';
            }

            if(type =="delete_title_list"){

                name_title = $(this).parent().parent().find('.name_title').val();
                type_list = parseInt($(this).parent().parent().find('.type_list').val());
                text = 'Se eliminará ' + name_title + ' de tus lista';
                p_text = $('<p class="p_text_dialog">' + text + '</p>');
                span_text.append(p_text);

            }

            if(type=="delete_title"){

                name_title = $(this).parent().parent().find('.name_title').val();
                type_list = parseInt($(this).parent().parent().find('.type_list').val());
                list = '';
                if(type_list==0){
                    list = 'favoritos';
                }
                if(type_list==1){
                    list = 'leídos';
                }
                if(type_list==2){
                    list = 'por leer';
                }
                text = 'Se eliminará ' + name_title + ' de tus libros ' + list;
                p_text = $('<p class="p_text_dialog">' + text + '</p>');
                span_text.append(p_text);

            }
            if(type=="edit_read"){
                name_title = $(this).parent().parent().find('.name_title').val();
                text = 'Editar libro leído';
                p_text = $('<p class="p_text_dialog">' + text + '</p>');
                span_text.append(p_text);
                text2 = ' Fecha en que leíste ' + name_title;
                p_text2 = $('<p class="p_text_mini">' + text2 + '</p>');
                span_text.append(p_text2);
                span_text.append('<input type="text" class="fright hour-init"/>');
            }
            if(type=="delete_list"){
                name = $(this).parent().parent().find('.name_list').val();
                id_list = $(this).parent().parent().find('.id_list').val();
                text = '¿ Estás seguro que deseas eliminar ' + name + ' ?';
                p_text = $('<p class="p_text_dialog">' + text + '</p>');
                span_text.append(p_text);
            }
        }
        if($('.type').val()=="account"){
            text = 'Cerrar cuenta';
            text2 = '¿Estás seguro que deseas eliminar tu cuenta de ' +
                'Querétaro Lee ? Esta acción no se puede deshacer';
            p_text = $('<p class="p_text_dialog">' + text + '</p>');
            p_text2 = $('<p class="p_text_mini">' + text2 + '</p>');
            span_text.append(p_text);
            span_text.append(p_text2);

            href = 'href="/accounts/delete_user/"';
        }

        div_closet = $('<span class="dialog_closet"></span>');
        div_text = $('<div class="dialog_text grid-6 no-margin"></div>');
        btn_cancel = $('<span class="dialog_btn_cancel dialog_btn">Cancelar</span>');
        btn_acept = $('<a class="dialog_btn green_btn" ' + href + ' >Aceptar</a>');
        container_btn = $('<div class="dialog_container_btn"></div>');
        container_btn.append(btn_acept);
        container_btn.append(btn_cancel);
        $('.dialog-confirm').append(div_text);
        div_text.append(div_closet);
        div_text.append(span_text);

        if(($(this).find('.type_message').val())=='add_genre'){
            get_genre(div_text);
        }else{
            div_text.append(container_btn);
        }
        if(($(this).find('.type_message').val())=='delete_title'){
            var id_title = $(this).parent().parent().find('.id_title').val();
            btn_acept.click(function(){
                container_item = '';
                if(type_list==0){
                    container_item = 'book_favorite';
                }
                if(type_list==1){
                    container_item = 'book_read';
                }
                if(type_list==2){
                    container_item = 'book_for_reading';
                }
                d_item = $('.'+container_item).find('.d-item_' + id_title);
                delete_title(d_item);
            });
            closet(btn_acept);
        }

        if(($(this).find('.type_message').val())=='delete_title_list'){
            var id_title = $(this).parent().parent().find('.id_title').val();
            btn_acept.click(function(){
                item = $('.d-item_' + id_title).fadeOut(250,function(){
                    $(this).remove();
                });
            });
            closet(btn_acept);
        }

        if(($(this).find('.type_message').val())=='delete_list'){
            var id_list = $(this).parent().parent().find('.id_list').val();
            btn_acept.click(function(){
                d_list = $('.overview').find('.d-list_' + id_list);
                delete_list(d_list);
            });
            closet(btn_acept);
        }

        $('.dialog-confirm').fadeIn(250);
        $('.container_message').fadeIn(250);
        closet(div_closet);
        closet(btn_cancel);
        //closet($('.dialog-confirm').parent().parent());
        aling_message();

    });
}

function closet($ele){

  $ele.click(function(e) {
        $('.dialog-confirm').fadeOut(250);
        $('.container_message').fadeOut(250);
    });

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
