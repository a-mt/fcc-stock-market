
$(document).ready(function(){

	// Event remove
    $('#list').on('click', '.js-delete', function(){
        if(!confirm('Are your sure ?')) {
            return;
        }
        socket.emit('remove', $(this).closest('.item').data('symbol'));
    });

	// Event add
    $('.js-add').on('click', function(){
        submit($(this).closest('.input-group').children('.js-autocomplete'));
    });

	// Event type / add on enter
	$(".js-autocomplete").on('keyup', function(e){
	    if (e.which === 13) {
	        submit($(this));
	    }
	}).autoComplete({
		source: function(request,response) {
			$.ajax({
				beforeSend: function(){ 
					$("span.help-inline").show();
					$("span.label-info").empty().hide();
				},
				url: "/lookup",
				data: {
					input: request
				},
				success: function(data) {
				    data = JSON.parse(data);
				    data = $.map(data, function(item) {
						return {
							label: '<small class="pull-right">' + item.Symbol + '</small>' + item.Name + ' (' + item.Exchange + ')',
							value: item.Symbol
						}
					});
					response(data);
					$("span.help-inline").hide();
				}
			});
		},
        renderItem: function (ui, query) {
          return '<div class="autocomplete-suggestion" data-val="' + ui.value + '">' + ui.label + '</div>';
        }
	});
});

function submit($input) {
    var val = $input.val();
    socket.emit('add', val);
    $input.val('');
}