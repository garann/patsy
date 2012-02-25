var patsy = {
	
	cli: function( selector, dir, defaultTmpl ) {
		
		var that = this;
		this.prompt = $( selector );
		this.currentDir = dir;
		this.cmdBuffer = [];
		this.bufferPos;
		this.commandLine;

		$( document ).on( "keydown", function( e ) {
			if ( that.prompt.is( ":focus" ) ) {
				if ( e.keyCode == 8 ) {
					that.commandLine.text( txt.substring( 0, txt.length-1 ) );
					return false;
				} else if ( e.keyCode == 38 ) { 
					that.commandLine.text( that.cmdBuffer[that.bufferPos--] );
					return false;
				} else if ( e.keyCode == 40 ) { 
					if ( that.bufferPos == that.cmdBuffer.length-1 ) {
						that.commandLine.text( "" );
					} else {
						that.commandLine.text( that.cmdBuffer[++that.bufferPos] );
					}
					return false;
				}
			}
		});

		$( document ).on( "keypress", function( e ) {
			if ( that.prompt.is( ":focus" ) ) {
				var txt = that.commandLine.text(),
					cmd,
					dirs;
				if ( e.keyCode != 13 ) {
					that.commandLine.text( txt + String.fromCharCode( e.keyCode || e.charCode ) );
				} else {
					that.cmdBuffer.push( txt );
					that.bufferPos = that.cmdBuffer.length-1;
					cmd = txt.indexOf( " " ) > -1 ? txt.substring( 0,  txt.indexOf( " " ) ) : txt;
					if ( cmd == "ls" ) {
						require( ["text!" + that.currentDir + "/index.tmpl"], function( tmpl ) {
							that.render( patsy.getHtml( tmpl ), function() {
								that.render( patsy.getHtml() );	
							});
						});
					} else if ( cmd == "cd" ) {
						txt = txt.replace( "cd ", "" ).split( "/" );
						dirs = that.currentDir.split( "/" );
						for ( var i=0; i<txt.length; i++ ) {
							if ( txt[i] == ".." ) {
								dirs.pop();
							} else {
								dirs.push( txt[i] );
							}
						}
						that.currentDir = dirs.join( "/" );
						that.render( patsy.getHtml() );
					} else {
						txt = txt.replace( cmd, "" );
						require( ["text!" + that.currentDir + "/" + cmd + ".tmpl"], function( tmpl ) {
							if ( tmpl.indexOf( "<title>Error response</title>" ) >= 0 ) {
								that.render( that.commandLine.text() + ": command not found", function() {
									that.render( patsy.getHtml() );	
								});
								return false;
							}
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
				return false;
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
				       that.prompt.scrollTop( 9999 );
				       if ( callback ) callback();
			       }
				}, 5);        
	    
		    function printf( position ) {
		        var matches = txt.substr( position ).match( /<(\/)?([^ \/>]*).*?(\/)?>|./ ),
		            html = output.html(),
		            ending;
		        if ( matches[1] ) {
	            	ending = closing.length ? html.lastIndexOf(closing) : -1;
		            closing = closing.replace( ( "</" + matches[2] + ">" ) ,"" );
		        } else if ( matches[2] && !matches[3] ) {
		            ending = closing.length ? html.lastIndexOf(closing) : -1;
	                closing = "</" + matches[2] + ">" + closing;
	            } else {
		            ending = html.lastIndexOf( closing );
		        }
		        p += matches[0].length;
		        output.html( html.substring( 0,( ending>=0?ending:html.length ) ) + matches[0] + closing ); 
		        if ( matches[0].indexOf( "<br" ) > -1 ) {
		        	that.prompt.scrollTop( 9999 );
		        }                    
		    }
		}

		doT.templateSettings.strip = false;

		if ( defaultTmpl ) {
			require( ["text!" + this.currentDir + "/" + defaultTmpl + ".tmpl"], function( tmpl ) {
				that.render( patsy.getHtml( tmpl ), function() {
					that.render( patsy.getHtml() );	
				});
			});
		} else {
			this.render( patsy.getHtml() );
		}
	},
	getHtml: function( tmpl, data ) {
		if ( tmpl ) {
			if ( data ) {
				data = JSON.parse( data );
			} else {
				data = {};
			}
			return doT.template( tmpl )( data );
		} else {
			return '$ <span class="patsy-cli"></span><b>▒</b>';
		}
	}

};