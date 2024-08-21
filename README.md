# NOMIBO

nomibo is (i think failed, because i dont have time to finish this, because today (21 aug) I need go to different place to have another interview session) backoffice as per request for homework test from Nomina Games.

this backoffice can turn into bo, whilst nomi is nomina, you can find out there is 诺米波 text on dashboard after login, i dont know why i put this, maybe just to keep out some image from navbar, and after i ask on gpt what is 诺米波, it doesn't have meaning, it just Nuo Mi Bo... just like nomibo I ask... hehe

I don't mind if i not succeed on this, but surely I just want to not blacklisted by another company that request me to attend the interview, you know what I mean, I need job, but afraid by not attends the interview request that might be they will ignore me in future, so I made this long short description to let you know what situation.

instruction:

- how to install, you already know lah.. `npm i`
- today on this project i used my favorite libsql saas, Turso as my serverless sqlite-like database, so you can use mine (after you told me we are not in same road, will close it or change the key on my turso dashboard), or you can provide your key on turso
- after you got the key, you might have situation that no database and no data inside the database, don't cry... i made solution for that (thanks i know laravel before)
- you can use: `npm run db:migrate` to deploy any tables on the turso if not exist before
- but still no data exist, you can't login on dashboard yet, so use `npm run db:seed` to generate some data into tables
- at this moment, you already can login, but if you using my turso db, yeah.. the default user might be: `user1@example.com` and the password is `password1`, the user 2,3,4 same also the password should be using same numeric digit on last password...


how to access the dashboard:

- you can start by `npm run dev`
- access the `http://localhost:3000` or something else that you prepare
- you will asked a login
- then just login lah


what will you found on this:

- its not completed yet as per request, sorry... it's just last resort of mine, maybe you can consider me if there is no other candidancies that look good than mine
- it has orders, chart, but no details on order
- it has products, create, update, details
- it has users and roles, but this roles not refined yet since i dont using scope correctly (perhaps not completely used, since usually i use scope like this = order-create, order-view, order-update, etc)
- i don't know, this is front end test or full stack, since I also take lots time to develop the api (and integrate the database too...)


okay, let continue to other questions that i found on pdf

- architectural design: just let me know, why it's failed... i dunno.. I really hate redux... its like watching a youtube with title of "Tutorial Menyusahkan Diri Sendiri", so I use Zustand instead...
- I use some interfaces as per last meet you teach about inheritance of interface, so I learn it, thanks!!
- I use Turso as database

And about innovation, I don't know... I just made it like my previous work on K-Link, because they so influenced by Tokped... so I try to create another 'in-sense' of K-Link DNM stuff...

Thats all..
thanks alot and regards...


~fyuuuh, thats lot to types~