FROM ruby:3.1

# Installer les dépendances système nécessaires à Jekyll
RUN apt-get update -qq && apt-get install -y build-essential nodejs

# Installer Bundler
RUN gem install bundler

# Définir le dossier de travail
WORKDIR /srv/jekyll

# Copier les fichiers du projet dans le conteneur
COPY . /srv/jekyll

# Installer les gems nécessaires (github-pages inclus)
RUN bundle install

# Exposer le port utilisé par Jekyll
EXPOSE 4000

# Commande pour lancer le serveur Jekyll comme sur GitHub Pages
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0"]
