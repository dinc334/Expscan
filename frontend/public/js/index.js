"use strict";

$(document).ready(function(){
	$(function(){
		var current = location.pathname;
		$('.mainmenu li').each(function(){
        // if the current path is like this link, make it active
      let link = $(this).find('a').attr('href');
    	if(current == link) {
    		$(this).addClass('active')
    	}
    })
	})
  window.dataLayer = window.dataLayer || [];
   function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-137800637-1');
});

