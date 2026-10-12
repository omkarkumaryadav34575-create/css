#include <iostream>
using namespace std;
int main (){
    char character;
    cout<<"enter character"<<endl;
    cin>>character;
    cout<<(character>= 'a' && character<= 'z' ? "lowercase":"uppercase" )<<endl;
    return 0;
}