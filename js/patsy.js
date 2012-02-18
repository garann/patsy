var patsy = {
	
	cli: function( selector, dir, defaultTmpl ) {
		
		var that = this;
		this.prompt = $( selector );
		this.currentDir = dir;

		this.prompt.on( "keydown", function( e ) {
			var commandLine = that.prompt.find( "span.cli:last" ),
				txt = commandLine.text(),
				cmd,
				dirs;
			if ( e.keyCode != 13 ) {
				commandLine.text( txt + e.keyCode );
			} else {
				cmd = txt.substring( 0, txt.indexOf( " " ) );
				if ( cmd == "ls" ) {
					require( ["text!" + dir + "/index.tmpl"], function( tmpl) {
						patsy.render( tmpl, that.prompt );
					});
				} else if ( cmd == "cd" ) {
					txt = txt.replace( "cd " ).split( "/" );
					dirs = this.currentDir.split( "/" );
					for ( var i=0; i<txt.length; i++ ) {
						if ( txt[i] == ".." ) {
							dirs.pop();
						} else {
							dirs.push( txt[i] );
						}
					}
					this.currentDir = dirs.join( "/" );
				} else {
					txt = txt.replace( cmd, "" );
					require( ["text!" + that.currentDir + "/" + cmd], function( tmpl ) {
						patsy.render( txt.length ?
							patsy.append( tmpl, txt ) :
							patsy.append( tmpl ),
							that.prompt						
						);
					});
				}
			}

		});

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
	append: function( tmpl ) {
		if ( tmpl, data ) {
			return doT.template( tmpl )( data );
		} else {
			return '<div class="patsy-prompt">$ <span class="patsy-cli"></span></div>';
		}
	}

};