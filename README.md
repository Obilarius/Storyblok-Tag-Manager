## Benutzung

```
node index.js --slug "de-de/pages/fotobuecher-*"
```
Sucht nach allen Storys die mit `de-de/pages/fotobuecher-` beginnen und gibt die gefundenen Story aus.

```
node index.js --slug "de-de/pages/fotobuecher-*/" --tag "test-tag"
```
Fügt bei allen Storys die durch die Suche gefunden werden den Tag `test-tag`hinzu.

```
node index.js --slug "de-de/pages/fotobuecher-*/" --tag "test-tag" --alternates
```
Fügt bei allen Storys und derren Alternates die durch die Suche gefunden werden den Tag `test-tag`hinzu.

```
node index.js --help
```
Öffnet die Hilfe
