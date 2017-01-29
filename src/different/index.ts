function main(hello: Greetings) {
    console.log(hello.message);
}

main({ message: 'tsc compiles fine with include + different file names' });
