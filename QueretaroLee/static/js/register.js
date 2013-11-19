$(document).ready(function(){
    load_words();
    $('.main_btn, .register .login, .reset').click(function(e){
        var login = false;
        var reset = false;
        $('.invalid').fadeOut(250);
        if($(this).hasClass('login'))
            login = true;
        if($(this).hasClass('reset'))
            reset = true;
        var counter = 0;
        $('form.reset-password').fadeOut(300);
        $('.form-container').css({'width':'260px'});
        $('.container').children().fadeOut(300,
        function(){

            if (counter == 0){
                if(login){
                    $('.form-container').fadeIn(300,
                    function(){

                        $('.title span').html('Ingreso');
                        if($('form.register').is(':visible'))
                                $('form.register').fadeOut(300,function(){
                                $('form.login').fadeIn(300);
                            });
                        else{
                            $('form.login').fadeIn(300);
                        }
                    });
                }else if(reset){

                    $('.form-container').fadeIn(300,
                    function(){

                        $('.title span').html('Restaurar datos');
                        if($('form.login').is(':visible'))
                                $('form.login').fadeOut(300,function(){
                                $('form.reset-password').fadeIn(300);
                            });
                        else{
                            $('form.reset-password').fadeIn(300);
                        }
                    });
                }else{
                    $('.title span').html('¡Únete!');
                    $('.form-container').fadeIn(300,
                        function(){
                        $(this).css({'width':'460px'});
                        if($('form.login').is(':visible'))
                                $('form.login').fadeOut(300,function(){
                                $('form.register').fadeIn(300);
                            });
                        else{
                            $('form.register').fadeIn(300);
                        }

                    });
                }

            }
            counter++;
        });
        return false;
    });

    $('.close').click(function(){
        $(this).parent().parent().fadeOut(300,
        function(){
            $('.container').children().fadeIn(300,
                function(){
                    $('.form-container').css('display','none');
                    $('.form-container form').css('display','none');
                });
        });
        return false;
    });
    $('form p input').focus(function(){
        $(this).parent().find('.invalid').fadeOut(300);
        $(this).css({
            'background': '#FCF8EF'
        }).focusout(function(){
                if($.trim($(this).val()) == ''){
                    $(this).css({
                        'background': '#f4e5c8'
                    });
                }
            });
    });

    $('form').submit(function(e){

        var $form = $(this);
        var terms = true;
        if($form.hasClass('register')){
            var ter = parseInt($('.terms_user').val());
            if(ter == 0)
                terms = false;
        }


        if(valid_form & terms){
            $form.find('p').each(function(){
                $(this).find('input[type=text]').css({
                    'border-color': '#c2baab'
                })
            });
            $.ajax({
            type: "POST",
            url: $(this).attr('action'),
            data: $(this).serialize(),
                dataType: 'json'
            }).done(function(data) {
                    if(data.success == 1){
                        $form.find('.banner').removeClass('fail');
                        $form.find('.banner').addClass('success').html('Revisa tu correo para cambiar tu contraseña');
                        $form.find('input[name=email]').val('');
                        return;
                    }else if(data.success == 0){
                        $form.find('.banner').removeClass('success');
                        $form.find('.banner').addClass('fail').html('No se encontro un usuario con ese correo');
                        $form.find('input[name=email]').val('');
                        return;
                    }
                    if(data.success == 'True')
                        window.location.href = data.url;
                    else{
                        if($form.hasClass('register')){
                            $('.register .banner').html(data.url);
                            $('.register .banner').css('color','#f69376');
                        }
                        if($form.hasClass('login')){
                            $('.login .banner.error').html(data.url);
                        }
                    }
            });
        }
        return false;
    });
    $('.select').find('select').change(function() {
        $(this).parent().find('.text').html($(this).find(':selected').html());
    });
    var val = $(this).find('select option:eq(0)').val();
    $('select').val(val).trigger('change');

    $('.checkbox span').click(function(){
        if($.trim($(this).html()) == ''){
            $(this).html('×');
            if( ! $(this).hasClass('terms')){
                $('.create').animate({
                    'height': 30
                });
                $('.redirect-create').val(1);
            }else{
                $('.terms_user').val('1');
            }
        }else{
            $(this).html('');
            if( ! $(this).hasClass('terms')){
                $('.create').animate({
                    'height': 0
                });
                $('.redirect-create').val(0);
            }else{
                $('.terms_user').val('0');
            }
        }

    });
});


function load_words(){

    var words = {
        'No es posible vivir sin libros': 'Thomas Jefferson',
        'Un libro debe ser el hacha que rompa el mar helado que hay dentro de nosotros': 'Franz Kafka',
        'El que lee mucho y anda mucho, ve mucho y sabe mucho': 'Miguel de Cervantes Saavedra',
        'Allí donde se queman los libros, se acaba por quemar a los hombres':'Heinrich Heine',
        'Los libros son amigos que nunca decepcionan': 'Thomas Carlyle',
        'La literatura es el arte de la palabra': 'Manuel Gayol',
        'La escritura es la pintura de la voz': 'Voltaire',
        'La literatura es siempre una expedición a la verdad': 'Franz Kafka',
        'Más libros, más libres': 'Enrique Tierno Galván',
        'Los libros han ganado más batallas que las armas': 'Argensola',
        'El mundo está lleno de libros preciosos que nadie lee': 'Umberto Eco',
        'La lectura es el viaje de los que no pueden tomar el tren': 'Francis de Croisset',
        'Para viajar lejos, no hay mejor nave que un libro': 'Emily Dickinson',
        'Un hogar sin libros es como un cuerpo sin alma': 'Cicerón',
        'Una vez que has aprendido a leer, serás libre por siempre': 'Frederick Douglas',
        'Siempre imaginé que el Paraíso sería algún tipo de biblioteca': 'Jorge Luis Borges',
        'El que lee mucho intentará algún día escribir': 'William Cowper',
        'Los libros tienen su orgullo: cuando se prestan, no vuelven nunca': 'Theodor Fontane',
        'La literatura es libertad': 'Susan Sontag',
        'Carecer de libros propios es el colmo de la miseria': 'Benjamin Franklin',
        'Uno es de donde tiene los libros': 'Luis Señor',
        'Un hogar sin libros es como un cuerpo sin alma': 'Marco Tulio Cicerón',
        'Un libro es un regalo que puedes abrir una y otra vez': 'Garrison Keillor',
        'No puedes abrir un libro sin aprender algo': 'Confucio'
    }
    var len = 0;
    for (word in words){
        len++;
    }
    var random = Math.floor(Math.random()*(len+1));
    var index = 1;
    $.each(words, function(i){
        if(index == random){
            $('.caption .c').html(i);
            $('.caption .au').html(words[i]);
        }
        index++;
    })

}