$(document).ready(function(){
    $('.main_btn, .register .login, .reset').click(function(e){
        var login = false;
        var reset = false;
        if($(this).hasClass('login'))
            login = true;
        if($(this).hasClass('reset'))
            reset = true;
        var counter = 0;
        $('.container').children().fadeOut(300,
        function(){

            if (counter == 0){
                if(login){
                    $('.form-container').fadeIn(300,
                    function(){

                        $('.title span').html('Ingreso');
                        if($('form.register').is(':visible'))
                                $('form.register').fadeOut(300,function(){
                                $('form.login.grid-4').fadeIn(300);
                            });
                        else{
                            $('form.login.grid-4').fadeIn(300);
                        }
                    });
                }else if(reset){
                    $('.form-container').fadeIn(300,
                    function(){

                        $('.title span').html('Restaurar datos');
                        if($('form.login').is(':visible'))
                                $('form.login').fadeOut(300,function(){
                                $('form.reset-password.grid-4').fadeIn(300);
                            });
                        else{
                            $('form.reset-password.grid-4').fadeIn(300);
                        }
                    });
                }else{
                    $('.title span').html('¡Únete!');
                    $('.form-container').fadeIn(300,
                        function(){
                        if($('form.login').is(':visible'))
                                $('form.login').fadeOut(300,function(){
                                $('form.register.grid-4').fadeIn(300);
                            });
                        else{
                            $('form.register.grid-4').fadeIn(300);
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
            'background': '#fff'
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
        if(valid_form){
            $.ajax({
            type: "POST",
            url: $(this).attr('action'),
            data: $(this).serialize(),
                dataType: 'json'
            }).done(function(data) {
                    if(data.success == 'True')
                        window.location.href = data.url;
                    else{
                        if($form.hasClass('register')){
                            $('.register .banner').html(data.url);
                            $('.register .banner').css('color','#f69376');
                        }
                        if($form.hasClass('login')){
                            $('.login .banner').html(data.url);
                        }
                    }
            });
        }
        return false;
    });
});
