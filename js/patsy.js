var patsy = {
	
	cli: function( selector, dir, defaultTmpl ) {
		
		var that = this;
		this.prompt = $( selector );
		this.currentDir = dir;
		this.commandLine;

		$( document ).on( "keypress", function( e ) {
			if ( that.commandLine ) {
				var txt = that.commandLine.text(),
					cmd,
					dirs;
				if ( e.keyCode != 13 ) {
					that.commandLine.text( txt + String.fromCharCode( e.keyCode ) );
				} else {
					cmd = txt.indexOf( " " ) > -1 ? txt.substring( 0,  txt.indexOf( " " ) ) : txt;
					if ( cmd == "ls" ) {
						require( ["text!" + dir + "/index.tmpl"], function( tmpl) {
							that.render( patsy.getHtml( tmpl ) );
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
						require( ["text!" + that.currentDir + "/" + cmd + ".tmpl"], function( tmpl ) {
							that.render( txt.length ?
								patsy.getHtml( tmpl, txt ) :
								patsy.getHtml( tmpl )			
							);
						});
					}
				}
			}
		});

		this.prompt.on( "click", function() {
			that.commandLine = $( this ).find( "span.patsy-cli" );
		});

		this.render = function( html ) {
			var txt = html.replace( "\n", "<br/>" ),
				output = that.prompt.append( '<div class="patsy-prompt"></div>' ),
				l = txt.length,
				p = 0,
				closing = "",
				printer = setInterval(function() {
				   if (p < l) {
				       printf(p);  
				   } else {
				       clearInterval(printer);
				       that.commandLine = output;
			       }
				}, 100);        
	    
		    function printf(position) {
		        var matches = txt.substr(position).match(/<(\/)?([^ \/>]*).*?(\/)?>|./),
		            html = output.html(),
		            ending;
		        if ( matches[1] ) {
	            	ending = closing.length ? html.lastIndexOf(closing) : -1;
		            closing = closing.replace(("</" + matches[2] + ">"),"");
		        } else if ( matches[2] && !matches[3] ) {
		            ending = closing.length ? html.lastIndexOf(closing) : -1;
	                closing = "</" + matches[2] + ">" + closing;
	            } else {
		            ending = html.lastIndexOf(closing);
		        }
		        p += matches[0].length;
		        output.html(html.substring(0,(ending>=0?ending:html.length)) + matches[0] + closing);                    
		    }
		}

		this.render( patsy.getHtml() );

	},
	getHtml: function( tmpl, data ) {
		if ( tmpl ) {
			console.log(tmpl)
			return doT.template( tmpl )( data || {} );
		} else {
			return '<div class="patsy-prompt">$ <span class="patsy-cli"></span>▒</div>';
		}
	}

};