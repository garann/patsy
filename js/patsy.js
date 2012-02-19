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
							that.render( patsy.getHtml( tmpl ), function() {
								that.render( patsy.getHtml() );	
							});
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
								patsy.getHtml( tmpl ),
								function() {
									that.render( patsy.getHtml() );
								}			
							);
						});
					}
				}
			}
		});

		this.prompt.on( "click", function() {
			var $t = $( this );
			$t.find( "div.patsy-prompt:last" ).addClass( "patsy-active" );
			that.commandLine = $t.find( "span.patsy-cli:last" );
		});

		this.render = function( html, callback ) {
			that.prompt.find( "div.patsy-active" ).removeClass( "patsy-active" );
			that.commandLine = null;
			var txt = html.replace( /\n/gi, "<br/>" ),
				output = $( '<div class="patsy-prompt"></div>' ).appendTo( that.prompt ),
				l = txt.length,
				p = 0,
				closing = "",
				printer = setInterval(function() {
				   if (p < l) {
				       printf(p);  
				   } else {
				       clearInterval(printer);
				       output.addClass( "patsy-active" );
				       if ( output.find( "span.patsy-cli" )[0] ) that.commandLine = output.find( "span.patsy-cli" );
				       if ( callback ) callback();
			       }
				}, 5);        
	    
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

		doT.templateSettings.strip = false;
		this.render( patsy.getHtml() );

	},
	getHtml: function( tmpl, data ) {
		if ( tmpl ) {
			return doT.template( tmpl )( data || {} );
		} else {
			return '$ <span class="patsy-cli"></span><b>▒</b>';
		}
	}

};