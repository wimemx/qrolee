var content_search_entity = false;
var header_search_entity = false;
var entity_search_events = false;
var months = ['Enero','Febrero','Marzo','Abril',
    'Mayo','Juno','Julio','Agosto','Septiembre','Octubre',
    'Noviembre','Diciembre'];
var days = ['lunes','martes','miercoles',
    'jueves','viernes','sabado','domingo'];
var site_url = window.location.origin;

function text_no_found(){
    $('.d-not_found').fadeOut(250,function(){
        $(this).remove();
    });
    type = '';
    div_width = 'grid-13';
    if($('.type').val()=='organization')
        type = 'organizaciones';
    if($('.type').val()=='group')
        type = 'grupos';
    if($('.type').val()=='spot'){
        type = 'spots';
        div_width = 'grid-7';
    }

    div = $('<div class="d-not_found ' + div_width + '" ></div> ');
    div.append('No encontraron ' + type);
    $('.overview').append(div);
    div.fadeIn(300);
}

function init(lat,long) {
	var styles =[
  {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#fd947a" }
    ]
  },{
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.arterial",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#f1b191" }
    ]
  },{
    "featureType": "road.local",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#ffffff" }
    ]
  }
];
	var styledMap = new google.maps.StyledMapType(styles,
    {name: "Styled Map"});
		var latlng = new google.maps.LatLng( lat, long);
		var settings = {
			zoom: 13,
			center: latlng,
			mapTypeControl: true,
			mapTypeControlOptions: {
			  mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
			},
			navigationControl: true,
			navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
			mapTypeId: google.maps.MapTypeId.ROADMAP


    };
	var map = new google.maps.Map(document.getElementById("map"), settings);
	var companyLogo = new google.maps.MarkerImage('/static/img/gmap_marker.png',
		new google.maps.Size(100,50),
		new google.maps.Point(0,0),
		new google.maps.Point(50,50)
	);
	var companyPos = new google.maps.LatLng(lat,long);
	var companyMarker = new google.maps.Marker({
		position: companyPos,
		map: map,
		icon: companyLogo,
		title:"Qro Lee"
	});
	map.mapTypes.set('map_style', styledMap);
    map.setMapTypeId('map_style');
 }

var geocoder;
var map;
var marker;
	function initialize(lat,long) {
			var latlng = new google.maps.LatLng(20.600008,-100.388363);
			var settings = {
				zoom: 13,
				center: latlng,
				mapTypeControl: true,
				mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
				navigationControl: true,
				navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
				mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(document.getElementById("map"), settings);
		geocoder = new google.maps.Geocoder();
		marker = new google.maps.Marker({
			position: latlng,
			map: map,
			icon: new google.maps.MarkerImage(
				"/static/img/gmap_marker.png", // reference from your base
				new google.maps.Size(36, 36), // size of image to capture
				new google.maps.Point(0, 0), // start reference point on image (upper left)
				new google.maps.Point(10, 10), // point on image to center on latlng (scaled)
				new google.maps.Size(20, 20) // actual size on map
			),
			draggable: true
		});
		google.maps.event.addListener(marker, 'dragend', update_dir_info);
	};



function clear_input(no_clear){
    $('input').each(function(){
        if($(this).attr('name')){
            if(no_clear.indexOf($(this).attr('name')) < 0){
                $(this).val('');
            }
        }

    });
}


$(document).ready(function(){

    $('.heading .search .search_btn').click(function(){
        if($.trim($(this).parent().find('input[type=text]').val())
            != '')
            content_search_entity = true;
    });
    $('.header .search .icon').click(function(){
        if($.trim($(this).parent().find('input[type=text]').val())
            != '')
            header_search_entity = true;
    });
    if($.trim($('.sidebar-b input.entity').val()) != '')
        entity_search_events = true;

    $('.sidebar-b .controller .next').click(function(){

         if( curr_month<11 ){
            var position = $('.sidebar-b .year tr').position();
            var left = position.left-25;

            $('.sidebar-b .year tr').animate({
                'left':left-125
            });

        }
    });
    $('.sidebar-b .controller .prev').click(function(){
        if(curr_month>0){
            var position = $('.sidebar-b .year tr').position();
            var left = position.left-25;
            $('.sidebar-b .year tr').animate({
                'left':left+125

            });
        }
    });

    $( ".change" ).change(function() {
        $(this).parent().find('.text').html($(this).val());
    });
    $( "input.picture" ).change(function() {
        $(this).parent().find('.filename').html($(this).val());
    });
    $('form .select').each(function(){
        var val = $(this).find('select option:eq(0)').val();
        $(this).find('select').val(val).trigger('change');
    });
    $('span.settings').click(function(){

        if($(this).find('.sub-menu').is(':visible'))
            $(this).find('.sub-menu').fadeOut(300);
        else
            $(this).find('.sub-menu').fadeIn(300);
    });
    $('span.link_book').click(function(){
        if($(this).find('.sub-menu-book').is(':visible'))
            $(this).find('.sub-menu-book').fadeOut(300);
        else
            $(this).find('.sub-menu-book').fadeIn(300);
    });


    $('p.fb').click(function(){
            var search = '/me/groups?fields=cover,link,description,name,privacy,id';
            if($(this).hasClass('organization'))
                search = '/me/accounts?fields=description,name,location,perms,category,username,website,picture,cover';
            if($(this).hasClass("update"))
                fb_obj_search(search, -1);
            else
                fb_obj_search(search);
        });


});

function fb_obj_search(search, type){
    $('.lightbox-wrapper .fb-objs span').each(function(){
            $(this).remove();
        });
        $('.lightbox-wrapper').fadeIn(300);
        FB.api(search, function(response) {
            var len = response.data.length;
            $.each(response.data,function(index){
                var obj = response.data[index];
                var id = obj.id;
                var span = $('<span class="fleft grid-5"></span>');
                var span_wrapper = $('<span class="fleft wrapper"><img src="" ></span>');
                var title = $('<h3 class="title grid-3 fright"></h3>');
                var privacy = $('<p class="grid-3 fright"></p>');
                var link = $('<p class="grid-3 fright"></p>');
                var span_accept = $('<span class="green_btn fright">Acceptar</span>');
                if(obj.cover)
                    span_wrapper.find('img').attr('src',obj.cover.source);
                if(obj.link)
                    link.html(obj.link);
                var web;
                if(obj.link){
                    link.html(obj.link);
                    web = obj.link;
                }
                if(obj.website){
                    link.html(obj.website);
                    web = obj.website;
                }

                title.html(obj.name);
                privacy.html(obj.privacy);
                span.append(span_wrapper);
                span.append(title);
                span.append(privacy);
                span.append(link);
                span.append(span_accept);
                $('.fb-objs #scrollbar1 .overview').append(span);
                if((len-1) == index)
                    $('.fb-objs #scrollbar1').tinyscrollbar();


                span.find('.green_btn').click(function(){
                    if(type){
                        $('.lightbox-wrapper').fadeOut(300);
                        $('input.fb_i').val(obj.id);
                        $('p.fb').find('span').html('Has vinculado con: '+obj.name);
                        update_obj('fb_id',obj.id);
                        return;
                    }
                    clear_input(['submit','picture','cover_picture','csrfmiddlewaretoken','entity_type']);
                    $('input.fb_id').val(obj.id);
                    $('.lightbox-wrapper').fadeOut(300);
                    $('input[name=name]').val(obj.name);
                    $('textarea[name=description]').val(obj.description);
                    privacy = obj.privacy;
                    if(privacy == 'OPEN')
                        $('select.change:eq(1)').val($('select.change:eq(1) option:eq(0)').val()).trigger('change');
                    else
                        $('select.change:eq(1)').val($('select.change:eq(1) option:eq(1)').val()).trigger('change');
                    $('input[name=fb]').val(obj.id);
                    if(web)
                        $('input[name=website]').val(web);
                    if(obj.location){
                        var address = obj.location.street+' '+
                            obj.location.city+' '+obj.location.country;
                        if(obj.location.latitude){
                            address = new Array();
                            address.push(obj.location.latitude);
                            address.push(obj.location.longitude);
                            update_dir_info(null, address,1);
                        }else{
                            update_dir_info(address, null, 1);
                        }

                    }

                });
            });
        });
        $('.lightbox .close').click(function(){
            $('.lightbox-wrapper').fadeOut(300);
            return false;
        });
}

function update_dir_info(loc_address, lat_long, type){
    if(type){
        var latlng = new google.maps.LatLng(lat_long[0],lat_long[1]);
        marker.position = latlng;
        marker.setPosition(latlng);
		$('.lat').val(marker.getPosition().lat());
        $('.long').val(marker.getPosition().lng());
        if(geocoder){
            geocoder.geocode({'location':marker.getPosition()},function(results,status){
                var address = results[0].address_components[1].long_name +' '+
                    results[0].address_components[0].long_name +' '+
                    results[0].address_components[2].long_name +'#'+
                    results[0].address_components[3].long_name;

                $('.address').val(address);
            });
        }
    }else{
        $('.lat').val(marker.getPosition().lat());
        $('.long').val(marker.getPosition().lng());
        if(geocoder){
            geocoder.geocode({'location':marker.getPosition()},function(results,status){
                var address = results[0].address_components[1].long_name +' '+
                    results[0].address_components[0].long_name +' '+
                    results[0].address_components[2].long_name +'#'+
                    results[0].address_components[3].long_name;
                $('.address').val(address);
            });
        }
    }
};

function dmap(data,id){

        var styles = [
        {
        stylers: [
            { hue: "#b3d4fc" },
            { saturation: -20 }
          ]
        },{
          featureType: "road",
          elementType: "geometry",
          stylers: [
            { lightness: 100 },
            { visibility: "simplified" }
          ]
        },{
        featureType: "road",
        elementType: "labels",
        stylers: [
            { visibility: "off" }
          ]
          }
        ];

        var styledMap = new google.maps.StyledMapType(styles,
        {name: "Styled Map"});

        var latlon = $('.d-latlon').val().split(",");

        var lat = parseFloat(latlon[0]);
        var lon = parseFloat(latlon[1])  ;

        var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(lat,lon),
        mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
        }
        };

        var map = new google.maps.Map(document.getElementById('d-map'),
        mapOptions);


        if(id==1){
            var counter = 0;

            $.each(data,function(index,k){
                    var spot = data[index];
                 $.each(spot,function(index2){

                    var companyPos = new google.maps.LatLng(spot[index2].lat,spot[index2].long);
                    var companyMarker = new google.maps.Marker({
                    position: companyPos,
                    map: map,
                    labelClass: "labels", // the CSS class for the label
                    icon: new google.maps.MarkerImage(
				        "/static/img/markers/marker"+counter+".png", // reference from your base
				        new google.maps.Size(20, 34), // size of image to capture
				        new google.maps.Point(0, 0), // start reference point on image (upper left)
				        new google.maps.Point(0, 0) // point on image to center on latlng (scaled)

			        ),
                        title:spot[index2].name

                    });
                    counter++;
                    });

            });
        }
}


$(document).ready(function(){

    $('#scrollbar1').tinyscrollbar({
        sizethumb: 20
    });
    $('.heading .search .search_btn').click(function(){
        if($.trim($(this).parent().find('input[type=text]').val())
            != '')
            content_search_entity = true;
    });
    $('.header .search .icon').click(function(){
        if($.trim($(this).parent().find('input[type=text]').val())
            != '')
            header_search_entity = true;
    });
    if($.trim($('.sidebar-b input.entity').val()) != '')
        entity_search_events = true;

    $('.sidebar-b .controller .next').click(function(){

         if( curr_month<11 ){
            var position = $('.sidebar-b .year tr').position();
            var left = position.left-25;

            $('.sidebar-b .year tr').animate({
                'left':left-125
            });

        }
    });
    $('.sidebar-b .controller .prev').click(function(){
        if(curr_month>0){
            var position = $('.sidebar-b .year tr').position();
            var left = position.left-25;
            $('.sidebar-b .year tr').animate({
                'left':left+125

            });
        }
    });
    var init_map = false;
    $('.entity .nav .btn').click(function(){
        $(this).parent().find('.btn').each(function(){
           $(this).removeClass('active');
        });
        $(this).addClass('active');
        if($('#map').length > 0){
            if($('.lat').val() != ''){
                if(!init_map)
                    init(parseInt($('.lat').val()),parseInt($('.long').val()));
                init_map = true;
            }else{
                init(-100.4057373,20.6144226);
            }
        }
        var index = $(this).index();
        var len = $('.load').length;
        $('.load').each(function(i){
            if((len-1) == i){
                $(this).fadeOut(300,function(){
                    $('.load:eq('+index+')').fadeIn(300,function(){
                        if($(this).find("*[class*='user']").length >0)
                            $(this).find("*[class*='user']").each(function(){
                                $(this).fadeIn(300);
                            });
                        $('.load:eq('+index+') #scrollbar1').tinyscrollbar();
                    });
                });
            }else{
                $(this).fadeOut(300);
            }
        });

    });
    $( ".change" ).change(function() {
        $(this).parent().find('.text').html($(this).val());
    });
    $( "input.picture" ).change(function() {
        $(this).parent().find('.filename').html($(this).val());
    });
    $('form .select').each(function(){
        var val = $(this).find('select option:eq(0)').val();
        $(this).find('select').val(val).trigger('change');
    });
    $('span.brown_btn').click(function(){
        if($(this).find('.sub-menu').is(':visible'))
            $(this).find('.sub-menu').fadeOut(300);
        else
            $(this).find('.sub-menu').fadeIn(300);
    });


    $('p.fb').click(function(){
            var search = '/me/groups?fields=cover,link,description,name,privacy,id';
            if($(this).hasClass('organization'))
                search = '/me/accounts?fields=description,name,location,perms,category,username,website,picture,cover';
            if($(this).hasClass("update"))
                fb_obj_search(search, -1);
            else
                fb_obj_search(search);
        });
    $('.checkbox span').click(function(){
        if($.trim($(this).html()) != '')
            $(this).html('');
        else
            $(this).html('×');
    });
    $('.advanced_search_btn').click(function(){
        if($('.advanced_search').is(':visible'))
            $('.advanced_search').fadeOut(300);
        else{
            $('.advanced_search').fadeIn(300,function(){
                if($(this).hasClass('map'))
                    $('#map').fadeIn(300,initialize(20.600008,-100.388363));
            });
        }
    });


    $('.filter .checkbox').click(function(){
        $('.filter .checkbox').each(function(){
            $(this).removeClass('active');
        });
        $(this).addClass('active');

        var type = $(this).parent().find('.active').attr('class').split(' ');
        var category_type = -1;
        var join = 'none';
        var and = 0;
        var query, fields, search, result;
        var create_user = false;

        category_type = parseInt(type[3]);
        type = type[2];
        $('.advanced_search').remove();
        if(category_type == 1)
            create_user = true;

        if(type == 'registry.category'){
            override = true;
            query = {
                'name__icontains':'',
                'type': category_type
            }
            and = 1;
            fields = ['name', 'id'];
        }else if(type == 'account.genre'){
            override = true;

            query = {
                'name__icontains':''
            }
            fields = ['name', 'id'];
        }

        search = {
            'type': type,
            'fields': JSON.stringify(fields),
            'value': JSON.stringify(query),
            'and': and,
            'join': join
        }
        search = JSON.stringify(search);
        $('.results .item').each(function(){
            $(this).remove();
        });
        if (type != 'privacy' && type != 'event')
            result = advanced_search(search, $('.advanced_filter').find('div input[type=hidden]').val());

        if(type == 'registry.category'
            || type == 'account.genre'){
                if(create_user)
                    create_template('user', result, category_type);
                else
                    create_template('category', result, category_type);

        }else if(type == 'event'){
            create_template('event');
        }else if(type == 'privacy')
            create_template('privacy');

    });

    $('.advanced_filter .search_btn').click(function(){
        var create_user = false;
        var search = new Array();
        var query;
        var fields;
        var and = 0;
        var override = false;
        var join = 'none';
        var _in = new Array();
        var type = $('.filter').find('.active').attr('class').split(' ');
        var category_type = '';
        var result;

        category_type = parseInt(type[3]);
        type = type[1];


        if(type == 'auth.user'){
            var search_lists = new Array();
            var filters = new Array();
            if(category_type != ''){
                $('.advanced_search .checkbox').each(function(){
                    if($(this).find('span').html() != ''){
                        var _class = $(this).attr('class').split(' ');
                        if(isNaN(_class[1]))
                            search_lists.push(_class[1]);
                        else
                            search_lists.push(parseInt(_class[1]));
                    }
                });
                $('.advanced_search .search_filters').each(function(){
                    var filter = new Array();
                    if($(this).find('.change').val() == 'author_name'){
                        filter.push('first_name__icontains');
                        filter.push($(this).find('input').val());
                    }else if($(this).find('.change').val() == 'book_title'){
                        filter.push('title__icontains');
                        filter.push($(this).find('input').val());
                    }
                    filters.push(filter);
                });
                query = {
                    'username__icontains': $.trim($('.advanced_filter .search').val()),
                    'first_name__icontains': $.trim($('.advanced_filter .search').val())
                }
                fields = ['first_name',
                    'last_name','username'];
                join = {
                    'tables':{
                        0: JSON.stringify(['registry.profile','auth.user'])
                    },
                    'quieres':{
                        0: JSON.stringify(['id'])
                    },
                    'fields':{
                        0: JSON.stringify(['picture'])
                    },
                    'type':{
                        0: JSON.stringify(search_lists)
                    },
                    'filters':{
                        0: JSON.stringify(filters)
                    }
                }
                //1: JSON.stringify(['account.list','account.listuser', 'account.author', 'account.listauthor'])

                join = JSON.stringify(join);
                create_user = true;

            }else{


            }
        }else if(type == 'account.author'){
            query = {
                'first_name__icontains': $.trim($('.advanced_filter .search').val()),
                'last_name__icontains': $.trim($('.advanced_filter .search').val())
            }
            fields = ['first_name',
                'last_name'];
            join = {
                'tables':{
                    0: JSON.stringify(['account.title','account.authortitle'])
                },
                'quieres':{
                    0: JSON.stringify(['author_id'])
                },
                'fields':{
                    0: JSON.stringify(['title'])
                }
            }
            join = JSON.stringify(join);
        }else if(type == 'account.list'){
            query = {
                'name__icontains': $.trim($('.advanced_filter .search').val())
            }
            fields = ['name','picture'];
            join = {
                'tables':{
                    0: JSON.stringify(['auth.user','account.listuser'])
                },
                'quieres':{
                    0: JSON.stringify(['list_id'])
                },
                'fields':{
                    0: JSON.stringify(['username','first_name','last_name'])
                }
            }
            join = JSON.stringify(join);
        }else if(type == 'registry.event'){
            var start_time = '';
            var end_time = '';
            if($('.date-init').val() != '')
                start_time = $('.date-init').val();
            if($('.date-end').val() != '')
                end_time = $('.date-end').val();

            query = {
                'name__icontains': $.trim($('.advanced_filter .search').val()),
                'start_time__gt':start_time,
                'end_time__lt':end_time
            }
            and = 1;
            fields = ['name','start_time','end_time','owner_id','picture'];
        }else if(type == 'registry.entity.1' || type == 'registry.entity.3'){

            $('.advanced_search .checkbox').each(function(){
                if($(this).find('span').html() != ''){
                    var _class = $(this).attr('class').split(' ');
                    _in.push(_class[1]);
                }
            });
            var s = {
                'type': 'registry.entitycategory',
                'fields': JSON.stringify(
                    ['entity_id']),
                'value': JSON.stringify({
                    'category_id__in': JSON.stringify(_in)
                }),
                'and': and,
                'join': join
            }
            s = JSON.stringify(s);
            var _ids = advanced_search(s, $('.advanced_filter').find('div input[type=hidden]').val());
            var ids = new Array();
            var distance = '';
            $.each(_ids,function(i){
                ids.push(parseInt(_ids[i].entity_id));
            });
            if($.trim($('.distance').val()) != '')
                distance = $.trim($('.distance').val())+'&'+$('.lat').val()+'&'+$('.long').val();

            query = {
                'name__icontains': $.trim($('.advanced_filter .search').val()),
                'type_id': category_type,
                'pk__in': JSON.stringify(ids),
                'distance': distance
            }
            fields = ['name', 'picture', 'user_id'];
            and = 1;
            join = {
                'tables':{
                    0: JSON.stringify(['registry.category', 'registry.entitycategory'])
                },
                'quieres':{
                    0: JSON.stringify(['entity_id'])
                },
                'fields':{
                    0: JSON.stringify(['name'])
                }
            }
            join = JSON.stringify(join);
        }else if(type == 'account.list'){
            $('.advanced_search .checkbox').each(function(){
                if($(this).find('span').html() != ''){
                    var _class = $(this).attr('class').split(' ');
                    _in.push(_class[1]);
                }
            });
            query = {
                'name__icontains': $.trim($('.advanced_filter .search').val()),
                'type_id': 2,
                'category_id__in': JSON.stringify(_in)
            }
            fields = ['name', 'picture', 'user_id'];
        }else if(type == 'registry.entity.2'){
            $('.advanced_search .checkbox').each(function(){
                if($(this).find('span').html() != ''){
                    var _class = $(this).attr('class').split(' ');
                    _in.push(parseInt(_class[1]));
                }
            });
            query = {
                'name__icontains': $.trim($('.advanced_filter .search').val()),
                'type_id': 1,
                'privacy__in': JSON.stringify(_in)
            }
            fields = ['name', 'picture', 'user_id', 'privacy'];
            and = 1;
        }else if(type == 'account.title'){

            $('.advanced_search .checkbox').each(function(){
                if($(this).find('span').html() != ''){
                    var _class = $(this).attr('class').split(' ');
                    _in.push(parseInt(_class[1]));
                }
            });
            var s = {
                'type': 'account.genretitle',
                'fields': JSON.stringify(
                    ['title_id']),
                'value': JSON.stringify({
                    'genre_id__in': JSON.stringify(_in)
                }),
                'and': and,
                'join': join
            }
            s = JSON.stringify(s);
            if(_in.length > 0){
                var _ids = advanced_search(s, $('.advanced_filter').find('div input[type=hidden]').val());
                var ids = new Array();
                $.each(_ids,function(i){
                    ids.push(parseInt(_ids[i].title_id));
                });
            }
            query = {
                'title__icontains': $.trim($('.advanced_filter .search').val()),
                'pk__in': JSON.stringify(ids)
            }
            fields = ['title', 'cover'];
            and = 1;
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
                    0: JSON.stringify(['first_name','last_name']),
                    1: JSON.stringify(['grade'])
                }
            }
            join = JSON.stringify(join);
        }
        if($.trim($('.advanced_filter .search').val()) != ''
            || override){
            search = {
                'type': type,
                'fields': JSON.stringify(fields),
                'value': JSON.stringify(query),
                'and': and,
                'join': join
            }
            search = JSON.stringify(search);
            $('.results .item').each(function(){
                $(this).remove();
            });
            var csrf = $('.advanced_filter').find('div input[type=hidden]').val();
            var api = false;
            if(type == 'account.title' || type == 'account.author'){
                result = advanced_search(search, csrf);
                query = {
                    'q': JSON.stringify($.trim($('.advanced_filter .search').val()).split(' ')),
                    'start_index': {
                        0: 0
                    },
                    'type': {
                        0: type
                    }
                }
                api = search_api(csrf, query);
            }else
                result = advanced_search(search, csrf);
            if(result.response != 0){
                $.each(result,function(i){
                    create_template(type, result, i, create_user);
                });
            }else{

            }

        }
    });
});

function create_template(type, result,i, create_user){
    var span;
    if(type == 'user'){
        span = $('<span class="advanced_search fleft">');
        var p = $('<p class="title">Usarios con gustos similares</p>');
        p.append('<span>');
        span.append(p);
        p = $('<p class="checkbox A">Autores</p>');
        p.append('<span>');
        span.append(p);
        p = $('<p class="checkbox G">Géneros</p>');
        p.append('<span>');
        span.append(p);
        p = $('<p class="checkbox T">Títulos</p>');
        p.append('<span>');
        span.append(p);
        p = $('<p class="checkbox 0">Títulos favoritos</p>');
        p.append('<span>');
        span.append(p);
        p = $('<p class="checkbox 1">Títulos por leer</p>');
        p.append('<span>');
        span.append(p);
        p = $('<p class="checkbox 2">Títulos leidos</p>');
        p.append('<span>');
        span.append(p);
        p = $('<p class="title fleft">Añadir un filtro</p>');
        span.append(p);
        p = $('<p class="fleft advanced_search_btn">+ Añadir otro filtro</p>');
        span.append(p);
        p.click(function(){
            var filter = $('<div style="margin-top:10px;" class="search_filters fleft">');
            var _span =  $('<span class="select_wrapper date alpha fright">');
            var inner_span = $('<span class="grid-2 select no-margin">');
            _span.append(inner_span);
            var input = $('<input style="margin-left:20px;" type="text" class="date">');
            _span.append(input);
            var text = $('<span class="text"></span>');
            inner_span.append(text);
            var dropdown =  $('<span class="dropdown">');
            inner_span.append(dropdown);
            var select = $('<select class="change value"><select>');
            var option = $('<option value="author_name">Autor favorito</option>');
            select.append(option);
            option = $('<option value="book_title">Titulo favorito</option>');
            select.append(option);
            inner_span.append(select);
            filter.append(_span);
            span.append(filter);
            select.change(function() {
                $(this).parent().find('.text').html($(this).find(':selected').html());
            });
            select.val('author_name').change();
        });

    }else if(type == 'category'){
        span = $('<div class="advanced_search fleft"></div>');
        var p = $('<p class="title">Búsqueda por categoria</p>');
        span.append(p);
        $.each(result,function(indx){
            p = $('<p class="checkbox '+result[indx].id+'"></p>');
            p.html(result[indx].name);
            p.append($('<span></span>'));
            span.append(p);
        });
        if(i == 3){
            var filter = $('<div style="margin-top:20px;" class="search_filters fleft">');
            var _span =  $('<span class="select_wrapper date alpha fright">');
            var inner_span = $('<span class="grid-2 select date no-margin">');
            _span.append(inner_span);
            var text = $('<span class="text">Distancia (km)</span>');
            inner_span.append(text);
            var input = $('<input class="distance date" type="text">');
            _span.append(input);
            filter.append(_span);
            span.append(filter);
            span.addClass('map');
        }

    }else if(type=='privacy'){
        span = $('<span class="advanced_search fleft">');
        for(var i=0;i<2;i++){
            var p;
            if(i == 0){
                p = $('<p class="checkbox 0"></p>');
                p.html('Público');
            }else{
                p = $('<p class="checkbox 1"></p>');
                p.html('Privado');

            }
            p.append($('<span></span>'));
            span.append(p);
        }
    }else if(type == 'event'){

        var filter = $('<div class="search_filters fleft">');
        span =  $('<span class="select_wrapper date alpha fright">');
        var inner_span = $('<span class="grid-2 select date no-margin">');
        span.append(inner_span);
        var text = $('<span class="text">Desde</span>');
        inner_span.append(text);
        var input_init = $('<input class="date-init date" type="text">');
        var input_end = $('<input class="date-end date" type="text">');
        input_init.datepicker({
            dateFormat: 'yy-mm-dd',
            onSelect: function(dateText) {
            },
            onClose: function( selectedDate ) {
                input_end.datepicker( "option", "minDate", selectedDate );
            }
        });
        span.append(input_init);
        filter.append(span);
        span =  $('<span class="select_wrapper date alpha fright">');
        inner_span = $('<span class="grid-2 select date no-margin">');
        span.append(inner_span);
        text = $('<span class="text">Hasta</span>');
        inner_span.append(text);

        span.append(input_end);
        filter.append(span);
        span = $('<span class="advanced_search fleft">');
        var p = $('<p class="title">Búsqueda por fecha</p>');
        span.append(p);
        span.append(filter);
        input_end.datepicker({
            dateFormat: 'yy-mm-dd',
            onSelect: function(dateText) {
            }
        });

    }else{
        var item = $('<div class="item"></div>');
        var wrapper_fleft = $('<span class="wrapper fleft"></span>');
        item.append(wrapper_fleft);
        var img = $('<img src="" attr="">');
        var url = '/static/media/users/'+result[i].user_id+
            '/entity/'+result[i].picture;
        img.attr('src', url);
        wrapper_fleft.append(img);
        var h3 = $('<h3 class="title no-margin grid-4 fright"></h3>');
        if(type == 'account.author' || create_user){
            h3.html(result[i].first_name
                +' '+result[i].last_name);
        }else if(type == 'account.title'){
            h3.html(result[i].title);
        }else{
            h3.html(result[i].name);
        }

        var p = $('<p class="fright no-margin grid-4"></p>');
        item.append(h3);
        if (type == 'registry.entity.2'){
            var privacy;
            if(result[i].privacy == 'False')
                privacy = 'Público';
            else
                privacy = 'Privado';
            p.html(privacy);
            item.append(p);
        }else if(type == 'registry.entity.1' ||
            type == 'registry.entity.3'){
            $.each(result[i].extras,function(indx){
                p = $('<p class="fright no-margin grid-4"></p>');
                p.html(result[i].extras[indx]);
                item.append(p);
            });
        }else if(type == 'account.list'){
            var text= 'Lista creada por ';
            if(result[i].extras[0] != 'None')
                p.html(text+result[i].extras[0]
                    + ' '+ result[i].extras[2] );
            else
                p.html(text+result[i].extras[1]);
            item.append(p);
        }else if(type == 'account.author'){
            p.html(result[i].extras[0].length+' Libros');
            item.append(p);
        }else if(type == 'account.title'){

            var text= '';
            p.html(text+result[i].extras[1][0]
                + ' '+ result[i].extras[1][1]);
            item.append(p);

        }else if(type == 'registry.event'){
            var date = result[i].start_time.split(' ');
            var hour = date[1].split(':');
            date = date[0];
            date = $.datepicker.parseDate("yy-mm-dd",  date);
            var date_string = days[date.getDay()-1]+', '+
                date.getDate()+' de '+months[date.getMonth()-1]+
                ' del '+date.getFullYear()+' '+hour[0]+':'+
                hour[1]+'hrs.';
            p.html(date_string);
            item.append(p);
            url = '/static/media/users/'+result[i].owner_id+
            '/event/'+result[i].picture;
            img.attr('src', url);
        }else if(create_user){
            p.html('Esta leyendo');
            item.append(p);
        }
        $('.results').append(item);
        return;
    }
    span.find('p').each(function(){
        $(this).find('span').click(function(){
            if($.trim($(this).html()) != '')
                $(this).html('');
            else
                $(this).html('×');
        });
    });
    $('.heading').after(span);
}
function get_genre($div_text){

        $.ajax({
            type: "POST",
            url: '/qro_lee/list_genre/',
            data: {
                'csrfmiddlewaretoken': $('.entity  div input[type=hidden]').val()
            },
            dataType: 'json'
        }).done(function(data){

            $div_text.find('.container_genre').remove();
            var div_container_genre =  $('.container_genres');
            div_container_genre.fadeOut(250);
            div_container_genre.empty();
            div = $('<div class="container_genre"></div>');

            $.each(data,function(i){
                var active = '';
                if(data[i].active){
                    active = ' active_genre ';
                }else{

                    span_g = $('<span class="grid-4 no-margin genre"></span>');
                    img_g = $('<img src="/static/img/start.png"/>');
                    span_g.append(img_g);
                    span_g.append(data[i].name);
                    div_container_genre.append(span_g);
                    div_container_genre.fadeIn(250);

                }

                span = $('<span class="grid-3 no-margin genre' + active +
                ' genre_black"></span>');
                id_genre = $('<input type="hidden" value="'+data[i].id+'" >');
                img = $('<img src="/static/img/start_black.png"/>');
                span_text = $('<span class="genre_name" >'+data[i].name+'</span>');
                span.append(id_genre);
                span.append(img);
                span.append(span_text);
                span.click(function(){
                   add_genre($(this));
                });
                div.append(span);
            });
            $div_text.append(div);
       });
}

function add_genre($span){
    $.ajax({
    type: "POST",
    url: '/registry/add_genre/',
    data: {
    'csrfmiddlewaretoken': $('.entity  div input[type=hidden]').val(),
    'id_genre':$span.find('input').val()
    },
    dataType: 'json'
    }).done(function(data){
        get_genre($span.parent().parent());
    });
}

