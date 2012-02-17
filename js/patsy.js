var patsy = {
	
	cli: function( selector, dir, defaultTmpl ) {
		
		var prompt = $( selector );

	},
	render: function( html, prompt ) {
		this.txt = html;
		this.output = prompt;

		var renderer = this,
			l = this.txt.length,
			p = 0,
			closing = "",
			printer = setInterval(function() {
			   if (p < l)
			       printf(p);  
			   else
			       clearInterval(printer);
			}, 100);        
    
	    function printf(position) {
	        var char = txt.charAt(position),
	            toAdd = "",
	            toBePrinted,
	            html = renderer.output.html(),
	            ending;
	        if (char == "\n") {
	            toAdd = "<br/>";
	            p++; 
	            ending = html.lastIndexOf(closing);
	        } else if (char == "<") {
	            toBePrinted = renderer.txt.substr(position);
	            p = position + toBePrinted.indexOf(">") + 1;
	            toAdd = renderer.txt.substring(position,p);
	            if (toBePrinted.charAt(1) == "/") {
	                ending = closing.length ? html.lastIndexOf(closing) : -1;
	                closing = closing.replace(("</" + toBePrinted.charAt(2) + ">"),"");
	            } else {
	                ending = closing.length ? html.lastIndexOf(closing) : -1;
	                closing = "</" + toBePrinted.charAt(1) + ">" + closing;
	            }
	        } else {
	            toAdd = char;
	            p++;
	            ending = html.lastIndexOf(closing);
	        }
	        renderer.output.html(html.substring(0,(ending>=0?ending:html.length)) + toAdd + closing);                    
	    }
	},
	type: function( key, prompt ) {
		
	}

};