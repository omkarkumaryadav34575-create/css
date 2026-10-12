#include <iostream>
using namespace std;
int main (){
    int a,b;
    cin>>a>>b;

    int a1 = a/10,a2=a%10,b1 = b/10,b2 =b%10;
    if(a1==b1|| a1==b2||a2==b1||a2==b2){
        cout<<"true"<<endl;
    } else {
        cout<<"false"<<endl;
    }
    

    return 0;
}