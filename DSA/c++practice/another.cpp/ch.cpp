#include <iostream>
using namespace std;
int main (){
    char ch;
    cin>>ch;
    if ((ch>='A' && ch<='Z') || (ch>='a' && ch<='z')){
        if (ch =='A' || ch=='a'||ch=='e'||ch=='E'||ch=='i'||ch=='I'||ch=='o'||ch=='O'||ch=='u'||ch=='U'){
            cout<<"vowel"<<endl;
        }



    } else cout<<"not an alphabet"<<endl;
    return 0;
}