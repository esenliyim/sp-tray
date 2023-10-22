
PKG_NAME = sp-tray
UUID = sp-tray@sp-tray.esenliyim.github.com
BASE_MODULES = metadata.json LICENSE.txt
SRC_MODULES = constants.js dbus.js extension.js panelButton.js
PREFS_MODULES = prefs.js settingsFields.js
INSTALLBASE = $(HOME)/.local/share/gnome-shell/extensions
DEST = $(INSTALLBASE)/$(UUID)
MSGSRC = $(wildcard locale/*/*/*.po)

all: extension

extension: ./schemas/gschemas.compiled $(MSGSRC:.po=.mo)

./schemas/gschemas.compiled: ./schemas/org.gnome.shell.extensions.sp-tray.gschema.xml
	glib-compile-schemas ./schemas/

./po/%.mo: ./po/%.po
	msgfmt -c $< -o $@

clean:
	rm -f ./schemas/gschemas.compiled
	rm -f ./po/*.mo

install: _build
	rm -rf $(DEST)
	mkdir -p $(DEST)
	cp -r ./_build/* $(DEST)
	-rm -fR _buil
	echo done

package: _build
	cd _build ; \
	zip -qr "$(PKG_NAME)$(ZIPVER).zip" .
	mv _build/$(PKG_NAME)$(ZIPVER).zip ./
	-rm -fR _build

_build: all
	-rm -fR ./_build
	mkdir _build
	cp $(BASE_MODULES) $(SRC_MODULES) _build
	cp $(PREFS_MODULES) _build
	mkdir -p _build/schemas
	cp schemas/*.xml _build/schemas
	cp schemas/gschemas.compiled _build/schemas
	mkdir -p _build/locale
	for l in $(MSGSRC:.po=.mo) ; do \
		af=_build/`dirname $$l .mo`; \
		lf=_build/$$l; \
		echo $$af; \
		mkdir -p $$af; \
		cp $$l $$lf; \
	done;
ifdef VERSION
	sed -i 's/"version": .*/"version": $(VERSION)/' _build/metadata.json;
else ifneq ($(strip $(GIT_VER)),)
	sed -i '/"version": .*/i\ \ "git-version": "$(GIT_VER)",' _build/metadata.json;
endif