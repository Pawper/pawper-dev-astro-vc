---
title: "Beginners Guide for WordPress CI/CD on HostGator using SSH & GitHub Actions"
date: "2026.05.22"
kicker: "Tutorial"
tags: ["WordPress", "Git"]
hook: "This guide should be followed at the very start of a WordPress project to create CI/CD for it using..."
series:
  name: "WordPress FAQ"
  part: 3
  total: 3
---

This guide should be followed at the very start of a WordPress project to create CI/CD for it using GitHub with GitHub Actions to deploy via SSH to your server hosting WordPress. For hosting I am using Hostgator.

Before following this guide you should be familiar with GitHub, WordPress theme or plugin development, and the command line/terminal. I am using Local by Flywheel and Windows Subsystem for Linux (WSL).

## FAQ
### What is GitHub Actions?
GitHub Actions is (among other things) a CI/CD platform for automating tasks in your pipeline/workflow such as building, testing and deploying. For more information visit the [GitHub Actions Documentation](https://docs.github.com/en/actions). I highly recommend reading the overview.

### What is CI?
Continuous integration refers to running automated tasks when code is committed to a remote repository (e.g., on GitHub).

### What is CD?
Continuous deployment refers to using automation to deploy production-ready code to a remote host, or update code on a remote host.

### What is SSH?
SSH is a protocol for connecting and authenticated with remote servers and services. SSH keys enable doing so without entering in a password or personal access token each time, although an SSH key can be further secured with a passphrase.

## Project Guide

> ### On HostGator (your server)
> 1. Go to cPanel and search for `SSH` to bring up **SSH Access**. Select it and on the next screen select **Manage SSH Keys**.
> 1. Select **Generate a New Key**.
> 1. Give the SSH Key the name `github_deploy`, then you can leave the rest of the options as-is and generate the key. Once key generation is complete, select **Go Back**.
> 1. Find the generated key under Public Keys and select **Manage**. 
> 1. Select **Authorize**. After the key is authorized, select **Go Back**.
> 1. Find the generated key under Private Keys and select **View/Download**. 
> 1. Select the SSH Key and copy it.

### On GitHub
1. Create a repository for the project. Set the `.gitignore` to be for WordPress

1. Create a `production` branch. Pushes to this branch should only be done from the `main` branch.

> 1. Go to the repository **Settings**, expand the **Secrets** menu and select **Actions**.
> 1. Select **New Repository Secret**.
> 1. Give it the name `DEPLOY_KEY` and paste in the copied SSH key. Ensure there are no extra line breaks or spaces at the end, then select **Add secret**.
> 1. You'll need another secret for the HostGator account authentication. Select **New Repository Secret** again, name it `HOSTING_ACCOUNT`, then:
>     1. Go to the Hostgator portal dashboard and select **Manage Package** for the domain.
>     1. Select **Settings**.
>     1. The account authentication will be `[user]@[host IP]`; put this into the value for the secret. Also take care that you get the username correct. I had a spelling mismatch that took me a while to identify and kept rejecting the SSH authentication.
>     1. Select **Add secret.**

### On HostGator
First ensure WordPress is set up. Then, you will need to use the CPanel terminal for this process, or SSH in (`ssh -p2222 <user>@<host IP>` and enter your CPanel password).

1. From the article [How to Use GitHub Deploy Keys](https://dylancastillo.co/how-to-use-github-deploy-keys/), complete the following sections: 

    1. **Create an SSH Key on Your Server** - On HostGator, the command provided will return an error, `unknown key type ed25519`, so instead enter the following to use `rsa` encryption instead of `ed25519`:
        ```
        ssh-keygen -t ecdsa -b 521 -C "USERNAME@EMAIL.com"
        ```

    1. **Add Key to SSH Config** - You will need to use this alternate template due to using `rsa` encryption instead of `ed25519`:
        ```
        Host github-YOUR-APP 
            Hostname github.com 
            AddKeysToAgent yes 
            PreferredAuthentications publickey 
            IdentityFile=<home directory>/.ssh/id_ecdsa
        ```
        Your `<home directory>` is going to be something like `home4/<username>`.

### On GitHub
1. From the article [How to Use GitHub Deploy Keys](https://dylancastillo.co/how-to-use-github-deploy-keys/), complete the following sections **but do not execute the `git clone` command**: 

    1. **Create a Deploy Key on GitHub** - You will need to enter the following in the HostGator terminal instead of the provided command due to using `rsa` encryption instead of `ed25519`:
        ```
        cat ~/.ssh/id_ecdsa.pub
        ```

    1. I named my deploy key on Github `HOSTGATOR_DEPLOY`.

### On HostGator
You will need to use the CPanel terminal to do this, or SSH in (`ssh -p2222 <user>@<host IP>` and enter your CPanel password).

1. Within the `public_html` directory of your WordPress project (or equivalent), clone the git remote into a `temp` directory.
    ```
    git clone git@github-YOUR-APP:<org/user>/<repo name>.git temp
    ```

1. Copy the contents of the `temp` directory to the root.
    ```
    cp -a temp/. .
    ```

1. Remove the `temp` directory.
    ```
    rm -r temp
    ```

### On your machine
1. Create the WordPress project locally using Local.

1. Locally within the `public` directory of your WordPress project, clone the git remote into a `temp` directory. Ensure that you remain in the `public` directory for this guide, as it should be the project root.
    ```
    git clone <url> temp
    ```
    Or if you use the GitHub CLI:
    ```
    gh repo clone <org/user>/<repo name> temp
    ```

1. Copy the contents of the `temp` directory to the root.
    ```
    cp -a temp/. .
    ```

1. Remove the `temp` directory.
    ```
    rm -r temp
    ```

1. Your `.gitignore` should look like this (I had to add `/*` so please take care, you do not want all files in the root included):
    ```yml
    # ignore everything in the root except the "wp-content" directory.
    /*
    !wp-content/
    
    # ignore everything in the "wp-content" directory, except:
    # "mu-plugins", "plugins", "themes" directory
    wp-content/*
    !wp-content/mu-plugins/
    !wp-content/plugins/
    !wp-content/themes/
    
    # ignore these plugins
    wp-content/plugins/hello.php
    
    # ignore specific themes
    wp-content/themes/twenty*/
    
    # ignore node dependency directories
node_modules/
    
    # ignore log files and databases
    *.log
    *.sql
    *.sqlite
    
    ```
    
    You may want to also modify it to exclude everything in the `plugins` directory (`wp-content/plugins/*`) and then add exceptions for plugins you create, since you may add plugins locally you do not want included. Those plugins can be added on the server and this will reduce your repo size.

1. Create `.github/workflows/deploy.yml`

1. Within `deploy.yml`, create the workflow file by pasting in the following YAML contents:

    ```yaml
    name: Deployment
    on:
      push:
        branches: [ production ]
    jobs:
      deploy:
        runs-on: ubuntu-latest
        steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: 20
        - name: Sync
          env:
            dest: '${{secrets.HOSTING_ACCOUNT}}:/mydir'
          run: |
            echo "${{secrets.DEPLOY_KEY}}" > deploy_key
            chmod 600 ./deploy_key
            rsync -chav \
              -e 'ssh -p 2222 -i ./deploy_key -o StrictHostKeyChecking=no' \
              --exclude /deploy_key \
              --exclude /.git/ \
              --exclude /.github/ \
              ./ ${{env.dest}}
    ```

1. Make a few changes to the above code based on your hosting.
    1. Hostgator requires port `2222` (passed using -p 2222) so if you have a different port you'll need to change this (or you may be able to remove it entirely).
    1. Be sure to update `/mydir` to the appropriate path on your hosting. For me it's `/home4/<username>/public_html`, substituting in the username. Also take care that you get the username correct. I had a spelling mismatch that took me a while to identify and kept rejecting the SSH authentication.

1. Modify the `.gitignore` to include the `.github` directory. you 
can add this under `!wp-content/`:
    ```
    !.github/
    ```
    
1. Stage changes, which will include the WordPress files already included in the folder, according to the `.gitignore` file, as well as your `.github` directory.
    ```
    git add .
    ```

1. Commit.
    ```
    git commit -m "WordPress setup"
    ```

1. Push changes to GitHub and set your upstream as the 'main' branch.
    ```
    git push --set-upstream origin main
    ```
 
1. After committing, you'll need to pass the changes from main to production as well.

    ```
    git push origin main:production
    ```
