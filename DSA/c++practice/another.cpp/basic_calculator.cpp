#include <iostream>
using namespace std;
int main() {
    int a,b;
    char op; cin>>op;
    cout<<"first enter the 2 numers"<<endl;
    cin>>a>>b;
    cout<<"now enter the operation you want to perform : \n";
    cin>>op;
    switch (op){
        case 'a+b' :out<<"sum is"; break;
        case 'a-b' :out<<"sum is"; break;
        case 'a*b' :out<<"sum is"; break;
        case 'a/b' :out<<"sum is"; break;
        case 'a%b' :out<<"sum is"; break;
    }

}