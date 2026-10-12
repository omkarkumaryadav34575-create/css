#include <iostream>
using namespace std;
int main(){
    int n;cin>>n;

    // upper half: rows 1 to n
    for(int row=1;row<=n;row++){
        for(int num=1;num<=row;num++){
            cout<<num;
        }
        for(int space=1;space<=2*(n-row);space++){
            cout<<" ";
        }
        for(int num2=row;num2>=1;num2--){
            cout<<num2;
        }
        cout<<endl;
    }

    // lower half: rows n-1 down to 1
    for(int row=n-1;row>=1;row--){
        for(int num=1;num<=row;num++){
            cout<<num;
        }
        for(int space=1;space<=2*(n-row);space++){
            cout<<" ";
        }
        for(int num2=row;num2>=1;num2--){
            cout<<num2;
        }
        cout<<endl;
    }
    return 0;
}